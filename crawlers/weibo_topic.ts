import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';

const reg_location = /location\.replace\(\"(.+)\"\)\;/;
const reg_fm = /FM.view\((.+)\)/;
const pre = 'http://d.weibo.com/';


const parse_tags = (script) => {
  try {
    if (script['domid'].match(/Pl_Core_T5MultiText__/)) {
      let $ = cheerio.load(script['html']);
      let aas = $('.pt_detail').find('a');
      let tags = aas.map((i, v) => {
        return {
          name: $(v).text().trim(),
          href: pre + $(v).attr('href')
        }
      })
      return tags.toArray();
    }
  } catch (error) {
    console.error(error);
  }
}

const crawl_topic = async () => {
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
        "Cookie": 'SUB=_2AkMuG0qwf8NxqwJRmPAUym7gaoh-yw3EieKYR7trJRMxHRl-yT83qmUntRAOyN6kp5Kr8Im7Pe8HA1ORXZtzfg..;Path=/;Domain=.weibo.com;Expires=Tue, 19 Jun 2018 12:37:27 GMT;HttpOnly;SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WhWbwEHA4SaJwizv8NSFRM4;expires=Tuesday, 19-Jun-2018 12:37:27 GMT;path=/;domain=.weibo.com;SRT=D.QqHBTrssMqBoW-RtOeYoWr9NUPBBPQbki-WYU-Xk5QVqMdbbNsbNi3MpNbHi5mYNUCsuPDXqVdsPUeMNA4yuOZShVDPIVZYHUOWASOYzAOEL4bYTWG9cSptl%2AB.vAflW-P9Rc0lR-ykKDvnJqiQVbiRVPBtS%21r3J8sQVqbgVdWiMZ4siOzu4DbmKPWfP-H3M4YBiEiYNeW95eRtObiF4%21rr;expires=Thu, 17-Jun-2027 12:37:27 GMT;domain=.passport.weibo.com;httponly;SRF=1497875847'
      }
    }
    let body = await rp(options);
    let match = body.match(reg_location);
    if (match) {
      options.url = match[1];
      body = await rp(options);
    }
    console.log(body);
    // let $ = cheerio.load(body);
    // let scripts = $('script');
    // scripts = scripts.map((i, v) => {
    //   let html = $(v).html();
    //   let match = html.match(reg_fm);
    //   if (match) {
    //     let data = JSON.parse(match[1]);
    //     return data;
    //   }
    // })
    // scripts = scripts.filter((i, v) => {
    //   if ('html' in v) {
    //     return true;
    //   }
    // })
    // scripts.map((i, v) => {
    //   let key = v['domid'];
    //   switch (true) {
    //     case /pl_common_top/.test(key):
    //     case /pl_common_oplogo/.test(key):
    //     case /pl_common_footer/.test(key):
    //     case /pl_common_topicbase/.test(key):
    //     case /plc_discover_nav/.test(key):
    //     case /plc_main/.test(key):
    //     case /plc_discover/.test(key):
    //     case /Pl_Discover_MixedTab__/.test(key):
    //     case /Pl_Discover_LeftNav__/.test(key):
    //     case /Pl_Core_Ut1UserList__/.test(key):
    //       break;

    //     case /Pl_Core_T5MultiText__/.test(key):
    //       tags = _.concat(tags, parse_tags(v));
    //       break;

    //     default:
    //       console.log(key);
    //       break;
    //   }
    // })
    // console.log(tags);
    return tags;
  } catch (error) {
    console.error(error);
  }
}

crawl_topic();

export {
  crawl_tag
}
