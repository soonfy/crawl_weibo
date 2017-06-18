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

const crawl_tag = async () => {
  try {
    let tags = [];
    let uri = 'http://d.weibo.com/1087030002_2986_top';

    console.log(uri);
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'd.weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2286942856549.21.1488107938571; UM_distinctid=15baf359da7c01-03d9466680a9eb-143d655c-1fa400-15baf359da8b32; _s_tentry=sass.weibo.com; Apache=6564239174790.121.1497437656999; ULV=1497437657072:18:7:4:6564239174790.121.1497437656999:1497357168711; login_sid_t=ea711f2add5a09c677082b8d7ef0dda8; TC-Page-G0=0cd4658437f38175b9211f1336161d7d; UOR=,,login.sina.com.cn; SCF=Ag3xO7UkzFJb1Zndsb1vN3dkWIVVhk8hN3aSCu7oUQDkztdmk3XcEWpPcDjKdCIell1bFZlGL6yERxLm4P7JhTQ.; SUB=_2A250QK35DeRhGeBO61IQ9yvEyT2IHXVXN5gxrDV8PUNbmtAKLW_-kW-ZG_-joiuDIaGQLozdxKVx-1cjBw..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5K2hUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0S7y95vZV3wB12; ALF=1529221417; SSOLoginState=1497685417; un=18610618644; wvr=6'
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
        let data = JSON.parse(match[1]);
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
        case /pl_common_topicbase/.test(key):
        case /plc_discover_nav/.test(key):
        case /plc_main/.test(key):
        case /plc_discover/.test(key):
        case /Pl_Discover_MixedTab__/.test(key):
        case /Pl_Discover_LeftNav__/.test(key):
        case /Pl_Core_Ut1UserList__/.test(key):
          break;

        case /Pl_Core_T5MultiText__/.test(key):
          tags = _.concat(tags, parse_tags(v));
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

crawl_tag();

export {
  crawl_tag
}
