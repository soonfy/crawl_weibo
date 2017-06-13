import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';

const reg_location = /location\.replace\(\"(.+)\"\)\;/;

const crawl_repost = async () => {
  try {
    let id = 4118187576118432;
    let uri = `http://weibo.com/aj/v6/mblog/info/big?ajwvr=6&id=${id}&__rnd=${Date.now()}`;
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
    console.log(body);
    let data = JSON.parse(body);
    let count = data.data.count;
    let page = data.data.page.pagenum,
      pages = data.data.page.totalpage;
    let $ = cheerio.load(data.data.html);
  } catch (error) {
    console.error(error);
  }
}

crawl_repost();
