import * as Crypto from 'crypto';
import * as rp from 'request-promise';
import * as iconv from 'iconv-lite';

const crawl_weibo_cookie = async () => {
  try {
    let uri = 'http://weibo.com/';
    let options = {
      uri,
      method: 'GET',
      encoding: null,
      resolveWithFullResponse: true,
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
      },
    }
    let resp = await rp(options);
    console.log(resp.headers);
    console.log(iconv.decode(resp.body, 'gbk'));
  } catch (error) {
    console.error(error);
  }
}

const crawl_weibo_login = async () => {
  try {
    let MD5Hash = Crypto.createHash('md5');
    MD5Hash.update(`${new Date().getTime() * 1000 + Math.round(Math.random() * 1000)}`);
    let fp = MD5Hash.digest('hex');
    let uri = `http://passport.weibo.com/visitor/genvisitor?cb=gen_callback&fp=${fp}`;
    let options = {
      uri,
      method: 'GET',
      resolveWithFullResponse: false,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'passport.weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
      },
    }
    let body = await rp(options);
    console.log(body);
    let reg_ret = /\(([\w\W]+)\)\;/;
    let match = body.match(reg_ret);
    if (match) {
      let ret = match[1];
      let tid = JSON.parse(ret).data.tid;
      console.log(tid);
      uri = `http://passport.weibo.com/visitor/visitor?a=incarnate&t=${encodeURIComponent(tid)}&w=1&c=100&gc=&cb=cross_domain&from=weibo&_rand=${Math.random()}`;
      options.uri = uri;
      options.resolveWithFullResponse = true;
      let resp = await rp(options);
      // console.log(resp);
      console.log(resp.headers);
    }
  } catch (error) {
    console.error(error);
  }
}

// crawl_weibo_cookie();
crawl_weibo_login();