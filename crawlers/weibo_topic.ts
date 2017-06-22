import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';

const reg_location = /location\.replace\(\"(.+)\"\)\;/;
const reg_fm = /FM.view\((.+)\)/;

const format_read = (text) => {
  let read = 0;
  switch (true) {
    case /亿/.test(text):
      read = text.slice(0, -1) * 100000000;
      break;
    case /万/.test(text):
      read = text.slice(0, -1) * 10000;
      break;

    default:
      read = text - 0;
      break;
  }
  return read;
}

const parse_tags = (script) => {
  try {
    if (script['domid'].match(/Pl_Discover_TextNewList__/)) {
      let $ = cheerio.load(script['html']);
      let aas = $('.ul_item').find('a');
      let tags = aas.map((i, v) => {
        if ($(v).attr('href').includes('weibo.com')) {
          return {
            name: $(v).find('.item_title').text().trim(),
            href: $(v).attr('href')
          }
        }
      })
      return tags.toArray();
    }
  } catch (error) {
    console.error(error);
  }
}

const crawl_tag = async () => {
  try {
    let tags = [];
    let uri = 'http://d.weibo.com/100803';
    // uri = `http://d.weibo.com/100803_-_page_hot_list?from=faxian#`;

    console.log(uri);
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'd.weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2286942856549.21.1488107938571; UM_distinctid=15baf359da7c01-03d9466680a9eb-143d655c-1fa400-15baf359da8b32; wb_publish_fist100_6000175821=1; TC-Ugrow-G0=370f21725a3b0b57d0baaf8dd6f16a18; TC-V5-G0=8518b479055542524f4cf5907e498469; _s_tentry=-; Apache=859832271144.9846.1498043602216; ULV=1498043602967:20:9:2:859832271144.9846.1498043602216:1497974326868; TC-Page-G0=1bbd8b9d418fd852a6ba73de929b3d0c; login_sid_t=20f9d89349efb30d834f5a09e66136e9; UOR=,,login.sina.com.cn; SSOLoginState=1498051583; WBtopGlobal_register_version=dd90749cc052f754; SCF=Ag3xO7UkzFJb1Zndsb1vN3dkWIVVhk8hN3aSCu7oUQDko2JA1TZSQXlhX5Z5Kq8_cRNuOHI3BpiViPEJQ-2faDs.; SUB=_2A250TgR3DeThGeRI41YX8yfMyD-IHXVXOnK_rDV8PUNbmtAKLWfzkW8o6tHJqPBSqtftlxZDOYS7juYsWg..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5l1ZOx79CQ1DJcU88uMQTv5JpX5K2hUgL.Fozc1hBce0.7e0e2dJLoI790dcvV9r.t; SUHB=0auRF7DUgtw9rN; ALF=1498656423; un=916946912@qq.com; WBStorage=5ea47215d42b077f|undefined; wvr=6'
      }
    }
    let body = await rp(options);
    // console.log(body);
    let match = body.match(reg_location);
    if (match) {
      options.url = match[1];
      body = await rp(options);
    }
    // console.log(body);
    let $ = cheerio.load(body);
    let scripts = $('script');
    scripts = scripts.map((i, v) => {
      let html = $(v).html();
      let match = html.match(reg_fm);
      if (match) {
        let text = match[1].replace(/\s+html/, '"html"');
        let data = JSON.parse(text);
        return data;
      }
    })
    scripts = scripts.filter((i, v) => {
      if ('html' in v) {
        return true;
      }
    })
    scripts.map((i, v) => {
      let key = v['domid'];
      switch (true) {
        case /pl_common_top/.test(key):
        case /pl_common_oplogo/.test(key):
        case /pl_common_footer/.test(key):
        case /Pl_Common_MusicPlayer__/.test(key):
        case /pl_common_topicbase/.test(key):
        case /plc_discover_nav/.test(key):
        case /plc_main/.test(key):
        case /plc_discover/.test(key):
        case /Pl_Discover_LeftNav__/.test(key):
        case /Pl_Discover_SingleTextb__/.test(key):
        case /Pl_Core_P7MultiPicPlay__/.test(key):
        case /Pl_Discover_Pt6Rank__/.test(key):
          break;

        case /Pl_Discover_TextNewList__/.test(key):
          tags = parse_tags(v);
          break;

        default:
          console.log(key);
          break;
      }
    })
    // console.log(tags);
    return tags;
  } catch (error) {
    console.error(error);
  }
}

const parse_topics = (script) => {
  try {
    if (script['domid'].match(/Pl_Discover_Pt6Rank__/)) {
      let $ = cheerio.load(script['html']);
      let divs = $('.info_box');
      let topics = divs.map((i, v) => {
        return {
          name: $(v).find('a').first().text().trim(),
          uri: $(v).find('a').first().attr('href'),
          read: format_read($(v).find('.number').text().trim()),
          mc: $(v).find('.tlink').text().trim(),
          mc_uri: $(v).find('.tlink').attr('href') || ''
        }
      })
      let status = 1;
      if ($('.next').hasClass('page_dis')) {
        status = 0;
      }
      return {
        status,
        topics: topics.toArray()
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// http://d.weibo.com/100803_ctg1_2_-_ctg12?cfs=920&Pl_Discover_Pt6Rank__4_filter=&Pl_Discover_Pt6Rank__4_page=1#Pl_Discover_Pt6Rank__4
// http://d.weibo.com/100803_ctg1_2_-_ctg12?cfs=920&Pl_Discover_Pt6Rank__4_filter=&Pl_Discover_Pt6Rank__4_page=2#Pl_Discover_Pt6Rank__4
// http://d.weibo.com/100803_ctg1_2_-_ctg12?cfs=920&Pl_Discover_Pt6Rank__4_filter=&Pl_Discover_Pt6Rank__4_page=3#Pl_Discover_Pt6Rank__4
// http://d.weibo.com/100803_ctg1_2_-_ctg12
const crawl_topics_bytag = async (tag, page) => {
  try {
    let topics;
    if (typeof tag === 'object') {
      tag = tag.href;
    }
    let num = page === 1 ? 4 : 5;
    num = 4;
    let uri = `${tag}?cfs=920&Pl_Discover_Pt6Rank__${num}_filter=&Pl_Discover_Pt6Rank__${num}_page=${page}#Pl_Discover_Pt6Rank__${num}`;
    console.log(uri);
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'd.weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2286942856549.21.1488107938571; UM_distinctid=15baf359da7c01-03d9466680a9eb-143d655c-1fa400-15baf359da8b32; wb_publish_fist100_6000175821=1; TC-Ugrow-G0=370f21725a3b0b57d0baaf8dd6f16a18; TC-V5-G0=8518b479055542524f4cf5907e498469; _s_tentry=-; Apache=859832271144.9846.1498043602216; ULV=1498043602967:20:9:2:859832271144.9846.1498043602216:1497974326868; TC-Page-G0=1bbd8b9d418fd852a6ba73de929b3d0c; login_sid_t=20f9d89349efb30d834f5a09e66136e9; UOR=,,login.sina.com.cn; SSOLoginState=1498051583; WBtopGlobal_register_version=dd90749cc052f754; SCF=Ag3xO7UkzFJb1Zndsb1vN3dkWIVVhk8hN3aSCu7oUQDko2JA1TZSQXlhX5Z5Kq8_cRNuOHI3BpiViPEJQ-2faDs.; SUB=_2A250TgR3DeThGeRI41YX8yfMyD-IHXVXOnK_rDV8PUNbmtAKLWfzkW8o6tHJqPBSqtftlxZDOYS7juYsWg..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5l1ZOx79CQ1DJcU88uMQTv5JpX5K2hUgL.Fozc1hBce0.7e0e2dJLoI790dcvV9r.t; SUHB=0auRF7DUgtw9rN; ALF=1498656423; un=916946912@qq.com; WBStorage=5ea47215d42b077f|undefined; wvr=6'
      }
    }
    let body = await rp(options);
    let match = body.match(reg_location);
    if (match) {
      options.url = match[1];
      body = await rp(options);
    }
    // console.log(body);
    let $ = cheerio.load(body);
    let scripts = $('script');
    scripts = scripts.map((i, v) => {
      let html = $(v).html();
      let match = html.match(reg_fm);
      if (match) {
        let text = match[1].replace(/\s+html/, '"html"');
        let data = JSON.parse(text);
        return data;
      }
    })
    scripts = scripts.filter((i, v) => {
      if ('html' in v) {
        return true;
      }
    })
    scripts.map((i, v) => {
      let key = v['domid'];
      switch (true) {
        case /pl_common_top/.test(key):
        case /pl_common_oplogo/.test(key):
        case /pl_common_footer/.test(key):
        case /Pl_Common_MusicPlayer__/.test(key):
        case /pl_common_topicbase/.test(key):
        case /plc_discover_nav/.test(key):
        case /plc_main/.test(key):
        case /plc_discover/.test(key):
        case /Pl_Discover_LeftNav__/.test(key):
        case /Pl_Discover_SingleTextb__/.test(key):
        case /Pl_Core_P7MultiPicPlay__/.test(key):
        case /Pl_Discover_TextNewList__/.test(key):
          break;

        case /Pl_Discover_Pt6Rank__/.test(key):
          topics = parse_topics(v);
          break;

        default:
          console.log(key);
          break;
      }
    })
    // console.log(topics);
    return topics;
  } catch (error) {
    console.error(error);
  }
}

const parse_topicdata = (script) => {
  try {
    if (script['domid'].match(/Pl_Core_T8CustomTriColumn__/)) {
      let $ = cheerio.load(script['html']);
      let tds = $('td');
      let read, comment, fan;
      tds.map((i, v) => {
        let value = $(v).find('strong').text().trim();
        let title = $(v).find('span').text().trim();
        switch (title) {
          case '阅读':
            read = format_read(value);
            break;
          case '讨论':
            comment = format_read(value);
            break;
          case '粉丝':
            fan = format_read(value);
            break;
          default:
            console.log(title);
            break;
        }
      })
      return {
        read,
        comment,
        fan
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const parse_topicinfo = (script) => {
  try {
    if (script['domid'].match(/Pl_Core_T8CustomTriColumn__/)) {
      let $ = cheerio.load(script['html']);
      let tds = $('td');
      let read, comment, fan;
      tds.map((i, v) => {
        let value = $(v).find('strong').text().trim();
        let title = $(v).find('span').text().trim();
        switch (title) {
          case '阅读':
            read = format_read(value);
            break;
          case '讨论':
            comment = format_read(value);
            break;
          case '粉丝':
            fan = format_read(value);
            break;
          default:
            console.log(title);
            break;
        }
      })
      return {
        read,
        comment,
        fan
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const crawl_topic_byuri = async (uri) => {
  try {
    // let uri = `http://weibo.com/p/10080892ed931ce2713ba8c8bac70ff0b83904?from=faxian_huati&mod=mfenlei`;
    console.log(uri);
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SUB=_2AkMuFvKSf8NxqwJRmPAXzW3ma4pwygDEieKYSgNJJRMxHRl-yT9jqnMItRBikG4LRzhheOGb2XClrYbxnrfZtw..;Path=/;Domain=.weibo.com;Expires=Thu, 21 Jun 2018 14:07:33 GMT;HttpOnly;SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9W5q2IX.JrjXfgevnX2pq16J;expires=Thursday, 21-Jun-2018 14:07:33 GMT;path=/;domain=.weibo.com;SRT=D.QqHBTrssMeSI4-RtOeYoWr9NUPBBdG9QJ-sYiGB35dWmMdbbNsbOSru1NbHi5mYNUCsuPDbgVduiNQMNAcbhMqMJ4e9fTFPLM-zpdmijVbb85FupSb9rWptl%2AB.vAflW-P9Rc0lR-ykKDvnJqiQVbiRVPBtS%21r3J8sQVqbgVdWiMZ4siOzu4DbmKPVsVOHHdCu1Vc9RScWbWcuRJeBoJOS1;expires=Sat, 19-Jun-2027 14:07:33 GMT;domain=.passport.weibo.com;httponly;SRF=1498054053'
      }
    }
    let body = await rp(options);
    let match = body.match(reg_location);
    if (match) {
      options.url = match[1];
      body = await rp(options);
    }
    // console.log(body);
    let $ = cheerio.load(body);
    let scripts = $('script');
    scripts = scripts.map((i, v) => {
      let html = $(v).html();
      let match = html.match(reg_fm);
      if (match) {
        let text = match[1].replace(/\s+html/, '"html"');
        let data = JSON.parse(text);
        return data;
      }
    })
    scripts = scripts.filter((i, v) => {
      if ('html' in v) {
        return true;
      }
    })
    scripts.map((i, v) => {
      let key = v['domid'];
      switch (true) {
        case /pl_common_top/.test(key):
        case /pl_common_footer/.test(key):
        case /plc_frame/.test(key):
        case /Pl_Core_StuffHeader__/.test(key):
        case /Pl_Core_CustTab__/.test(key):
        case /plc_main/.test(key):
        case /Pl_Core_PublishV6__/.test(key):
        case /Pl_Core_FansGroups__/.test(key):
        case /Pl_Core_Ut2UserList__/.test(key):
        case /Pl_Core_Pt6Rank__/.test(key):
        case /Pl_Third_App__/.test(key):
        case /Pl_Core_T4Generaltext__/.test(key):
          break;

        case /Pl_Core_T8CustomTriColumn__/.test(key):
          let data = parse_topicdata(v);
          console.log(data);
          break;
        case /Pl_Third_Inline__/.test(key):
          // let info = parse_topicdata(v);
          // console.log(info);
          break;
        case /Pl_Core_UserGrid__/.test(key):
          // let info = parse_topicdata(v);
          // console.log(info);
          break;
        case /Pl_Core_T5MultiText__/.test(key):
          // let info = parse_topicdata(v);
          // console.log(info);
          break;

        default:
          console.log(key);
          console.log(v.html);
          process.exit();
          break;
      }
    })
  } catch (error) {
    console.error(error);
  }
}

// crawl_tag();
// crawl_topics_bytag('http://d.weibo.com/100803_ctg1_2_-_ctg12', 2);
crawl_topic_byuri('http://weibo.com/p/10080892ed931ce2713ba8c8bac70ff0b83904?from=faxian_huati&mod=mfenlei');

export {
  crawl_tag,
  crawl_topics_bytag
}
