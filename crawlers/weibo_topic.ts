import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';

const reg_location = /location\.replace\(\"(.+)\"\)\;/;
const reg_fm = /FM.view\((.+)\)/;


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

    console.log(uri);
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'd.weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2286942856549.21.1488107938571; UM_distinctid=15baf359da7c01-03d9466680a9eb-143d655c-1fa400-15baf359da8b32; _s_tentry=sass.weibo.com; Apache=6564239174790.121.1497437656999; ULV=1497437657072:18:7:4:6564239174790.121.1497437656999:1497357168711; login_sid_t=ea711f2add5a09c677082b8d7ef0dda8; TC-Page-G0=0cd4658437f38175b9211f1336161d7d; WBtopGlobal_register_version=53f16dc9cc6ce8bd; UOR=,,login.sina.com.cn; wvr=6; SCF=Ag3xO7UkzFJb1Zndsb1vN3dkWIVVhk8hN3aSCu7oUQDkoOYq9UYLJiPt5SlmLZsZeVpkbsiFkfkFKVMJYONV9JA.; SUB=_2A250Qu6zDeRhGeBO61IQ9yvEyT2IHXVXNkd7rDV8PUNbmtANLRPdkW8M-kyJwot6UKDn3fErFgfMspxEVg..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5K2hUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0xnyreR2ppgEOd; ALF=1529336419; SSOLoginState=1497800419; un=18610618644'
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
          href: $(v).find('a').first().attr('href'),
          read: $(v).find('.number').text().trim(),
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

const crawl_topics_bytag = async (tag, page) => {
  try {
    let topics;
    if (typeof tag === 'object') {
      tag = tag.href;
    }
    let num = page === 1 ? 4 : 5;
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
        "Cookie": 'SINAGLOBAL=2286942856549.21.1488107938571; UM_distinctid=15baf359da7c01-03d9466680a9eb-143d655c-1fa400-15baf359da8b32; _s_tentry=sass.weibo.com; Apache=6564239174790.121.1497437656999; ULV=1497437657072:18:7:4:6564239174790.121.1497437656999:1497357168711; login_sid_t=ea711f2add5a09c677082b8d7ef0dda8; TC-Page-G0=0cd4658437f38175b9211f1336161d7d; WBtopGlobal_register_version=53f16dc9cc6ce8bd; UOR=,,login.sina.com.cn; wvr=6; SCF=Ag3xO7UkzFJb1Zndsb1vN3dkWIVVhk8hN3aSCu7oUQDkoOYq9UYLJiPt5SlmLZsZeVpkbsiFkfkFKVMJYONV9JA.; SUB=_2A250Qu6zDeRhGeBO61IQ9yvEyT2IHXVXNkd7rDV8PUNbmtANLRPdkW8M-kyJwot6UKDn3fErFgfMspxEVg..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5K2hUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0xnyreR2ppgEOd; ALF=1529336419; SSOLoginState=1497800419; un=18610618644'
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
    console.log(topics);
    return topics;
  } catch (error) {
    console.error(error);
  }
}

// crawl_tag();
// crawl_topics_bytag('http://d.weibo.com/100803_ctg1_2_-_ctg12', 1);

export {
  crawl_tag,
  crawl_topics_bytag
}
