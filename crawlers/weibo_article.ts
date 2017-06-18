import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';

const reg_location = /location\.replace\(\"(.+)\"\)\;/;
const reg_user_id = /id=(\d+)/;

const sleep = async (ss) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ss * 1000);
  })
}

const parse_repost = (html) => {
  try {
    let hots = [], reposts = [];
    let $ = cheerio.load(html);
    if ($('.between_line').length === 1) {
      let div_hots = $('.between_line').prevAll();
      hots = div_hots.map((i, v) => {
        let article_id = $(v).attr('mid');
        let user_id, user_name, address, topics = [], atnames = [], repost, comment, repost_time;
        let aa = $(v).find('.WB_text').children('a').first();
        user_name = aa.text().trim();
        let match = aa.attr('usercard').match(reg_user_id);
        if (match) {
          user_id = match[1];
        }
        let content = $(v).find('.WB_text').children('span').text().trim();
        let aas = $(v).find('.WB_text').children('span').children('a');
        aas.map((ii, vv) => {
          let usercard = $(vv).attr('usercard');
          let extra = $(vv).attr('extra-data');
          let text = $(vv).text().trim();
          if ($(vv).find('.ficon_cd_place').length === 1) {
            address = text.slice(1);
          } else if (/type=topic/.test(extra) || /type=topic/.test(usercard)) {
            topics.push(text);
          } else if (/type=atname/.test(extra) || /type=atname/.test(usercard)) {
            atnames.push(text);
          } else if ($(vv).find('.ficon_cd_img').length === 1) {
            console.log('图片内容');
          } else {
            // console.log($(vv).html());
            // console.log($(vv).text());
          }
        })
        aas.remove();
        let summary = $(v).find('.WB_text').children('span').text().trim();
        repost = $(v).find('.WB_handle').find('.S_txt1').eq(1).text().replace(/\D/g, '') - 0;
        comment = $(v).find('.WB_handle').find('.S_txt1').last().text().replace(/\D/g, '') - 0;
        repost_time = new Date($(v).find('.WB_from').children('a').attr('date') - 0);
        return { article_id, user_id, user_name, content, summary, address, topics, atnames, repost, comment, repost_time }
      })
      hots = hots.toArray();
      div_hots.remove();
    }
    let divs = $('.list_li');
    reposts = divs.map((i, v) => {
      let article_id = $(v).attr('mid');
      let user_id, user_name, address, topics = [], atnames = [], repost, comment, repost_time;
      let aa = $(v).find('.WB_text').children('a').first();
      user_name = aa.text().trim();
      let match = aa.attr('usercard').match(reg_user_id);
      if (match) {
        user_id = match[1];
      }
      let content = $(v).find('.WB_text').children('span').text().trim();
      let aas = $(v).find('.WB_text').children('span').children('a');
      aas.map((ii, vv) => {
        let usercard = $(vv).attr('usercard');
        let extra = $(vv).attr('extra-data');
        let text = $(vv).text().trim();
        if ($(vv).find('.ficon_cd_place').length === 1) {
          address = text.slice(1);
        } else if (/type=topic/.test(extra) || /type=topic/.test(usercard)) {
          topics.push(text);
        } else if (/type=atname/.test(extra) || /type=atname/.test(usercard)) {
          atnames.push(text);
        } else if ($(vv).find('.ficon_cd_img').length === 1) {
          console.log('图片内容');
        } else {
          // console.log($(vv).html());
          // console.log($(vv).text());
        }
      })
      aas.remove();
      let summary = $(v).find('.WB_text').children('span').text().trim();
      repost = $(v).find('.WB_handle').find('.S_txt1').eq(1).text().replace(/\D/g, '') - 0;
      comment = $(v).find('.WB_handle').find('.S_txt1').last().text().replace(/\D/g, '') - 0;
      repost_time = new Date($(v).find('.WB_from').children('a').attr('date') - 0);
      return { article_id, user_id, user_name, content, summary, address, topics, atnames, repost, comment, repost_time }
    })
    reposts = reposts.toArray();
    return { hots, reposts }
  } catch (error) {
    console.error(error);
  }
}

const crawl_repost = async (id, page) => {
  try {
    let uri = `http://weibo.com/aj/v6/mblog/info/big?ajwvr=6&id=${id}&page=${page}&__rnd=${Date.now()}`;
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2814765473589.067.1484875273060; UM_distinctid=15bad72a54e0-00d24291aaf45a-143e655c-1aeaa0-15bad72a54fbcd; _s_tentry=baike.baidu.com; Apache=7379909336866.972.1494990148978; ULV=1494990149138:24:4:1:7379909336866.972.1494990148978:1494582703733; YF-Ugrow-G0=ad83bc19c1269e709f753b172bddb094; YF-V5-G0=5f9bd778c31f9e6f413e97a1d464047a; YF-Page-G0=091b90e49b7b3ab2860004fba404a078; SSOLoginState=1495518028; login_sid_t=b369960338a09b7d9555a79cddb2a7b2; WBtopGlobal_register_version=4641949e9f3439df; UOR=,,login.sina.com.cn; SCF=AtsqdIRs1koTLva1VnsJpX-bIJ1gGWgh3aR67Hj41UVxGG2t4v5TfrrSroWVOB-L7UlrUGOhS1e-W1xOUZ0DJbk.; SUB=_2A250O-T6DeRhGeBO61IQ9yvEyT2IHXVXMVEyrDV8PUNbmtBeLRSskW-ZIquu62GwQdKAvWgMbiAbl-SfVg..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5KMhUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0G0e3uCLr3cozT; ALF=1528875048'
      }
    }
    let body = await rp(options);
    let match = body.match(reg_location);
    if (match) {
      options.url = match[1];
      body = await rp(options);
    }
    // console.log(body);
    let data = JSON.parse(body);
    let count = data.data.count;
    let pagenum = data.data.page.pagenum,
      totalpage = data.data.page.totalpage,
      html = data.data.html;
    let articles = parse_repost(html);
    // console.log(reposts);
    return {
      pagenum,
      totalpage,
      count,
      articles
    }
  } catch (error) {
    if (error.statusCode === 414) {
      console.error(error.message);
      console.error(`414 error. sleep 5m.`);
      await sleep(60 * 5);
      return await crawl_repost(id, page);
    }
    console.error(error);
  }
}

// crawl_repost(4118276278062890, 1);

export { crawl_repost }
