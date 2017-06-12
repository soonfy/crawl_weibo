import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

const reg_uid = /\$CONFIG\[\'oid\'\]\=\'([\w\d]+)\'/;
const reg_fm = /FM.view\((.+)\)/;
const reg_location = /location\.replace\(\"(.+)\"\)\;/;
// 'http://weibo.com/u/uid?is_all=1';

const crawl_weiboid_byuri = async (uri) => {
  try {
    let weibo_id = 'error';
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2814765473589.067.1484875273060; UM_distinctid=15bad72a54e0-00d24291aaf45a-143e655c-1aeaa0-15bad72a54fbcd; _s_tentry=baike.baidu.com; Apache=7379909336866.972.1494990148978; ULV=1494990149138:24:4:1:7379909336866.972.1494990148978:1494582703733; YF-Ugrow-G0=ad83bc19c1269e709f753b172bddb094; YF-V5-G0=5f9bd778c31f9e6f413e97a1d464047a; YF-Page-G0=091b90e49b7b3ab2860004fba404a078; SSOLoginState=1495518028; login_sid_t=b369960338a09b7d9555a79cddb2a7b2; WBtopGlobal_register_version=4641949e9f3439df; wvr=6; SCF=AtsqdIRs1koTLva1VnsJpX-bIJ1gGWgh3aR67Hj41UVxudrO_U6jQ606aUasOnS1ofkBtar4s-j0jQoDhiQty6Q.; SUB=_2A250M-GPDeRhGeBO61IQ9yvEyT2IHXVXSVRHrDV8PUNbmtBeLUPVkW9-y_LcjSMOmjep_pmoj7n9tZFkjA..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5KMhUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0LcizStCraDvHy; ALF=1528350045; UOR=,,login.sina.com.cn'
      }
    }
    let body = await rp(options);
    // console.log(body);
    let match = body.match(reg_location);
    if (match) {
      return await crawl_weiboid_byuri(match[1]);
    }
    match = body.match(reg_uid);
    // console.log(match[1]);
    if (match) {
      weibo_id = match[1];
    }
    return weibo_id;
  } catch (error) {
    console.error(error);
  }
}

const parse_userhead = (script) => {
  try {
    if (script['domid'].match(/Pl_Official_Headerv6__/)) {
      console.log(script['html']);
      let $ = cheerio.load(script['html']);
      let username = $('h1').text().trim();
      let signature = $('.pf_intro').eq(0).text().trim();
      let sex = 0;
      if ($('.icon_pf_male').length === 1) {
        sex = 1;
      } else if ($('.icon_pf_female').length === 1) {
        sex = 2;
      } else {
        console.error('未知性别');
      }
      return { username, signature, sex }
    }
  } catch (error) {
    console.error(error);
  }
}

const parse_userinfo = (script) => {
  try {
    if (script['domid'].match(/Pl\_Core\_UserInfo\_\_/)) {
      let $ = cheerio.load(script['html']);
      let level = $('.W_icon_level').eq(0).text().trim();
      level = level.replace(/\D/g, '');
      let signature = $('.info').eq(0).text().trim();
      let lis = $('li');
      let address, birth, info, personallink, bloglink, baidu, education, industry, sexlove, relationship, tags = [], otherlinks = [];
      lis.map((i, v) => {
        if ($(v).find('.ficon_cd_place').length === 1) {
          console.log('...地址...');
          address = $(v).children('span').last().text().trim();
        } else if ($(v).find('.ficon_constellation').length === 1) {
          console.log('...生日...');
          birth = $(v).children('span').last().text().trim();
        } else if ($(v).find('.ficon_pinfo').length === 1) {
          console.log('...简介...');
          info = $(v).children('span').last().text().trim();
          info = info.replace(/简介：/, '').trim();
        } else if ($(v).find('.ficon_link').length === 1) {
          console.log('...域名...');
          let temp = $(v).children('span').last().text().trim();
          if (temp.includes('个性域名')) {
            console.log('个性域名');
            personallink = {
              name: temp.replace(/个性域名：/, '').trim(),
              link: $(v).find('a').first().attr('href').trim()
            }
          } else if (temp.includes('博客地址')) {
            console.log('博客地址');
            bloglink = temp.replace(/博客地址：/, '').trim();
          } else {
            console.error('未处理的个性域名');
            process.exit();
          }
        } else if ($(v).find('.W_icon_level').length === 1) {
          console.log('...等级...');
          level = $(v).children('span').last().text().trim();
          level = level.replace(/\D/g, '').trim();
        } else if ($(v).find('.pinfo_icon_baidu').length === 1) {
          console.log('...百度资料...');
          $(v).find('.S_txt2').remove();
          $(v).find('a').remove();
          baidu = $(v).children('span').last().text().trim();
        } else if ($(v).find('.ficon_edu').length === 1) {
          console.log('...毕业院校...');
          education = $(v).find('a').text().trim();
        } else if ($(v).find('.ficon_bag').length === 1) {
          console.log('...行业类别...');
          $(v).find('.S_txt2').remove();
          industry = $(v).children('span').last().text().trim();
        } else if ($(v).find('.ficon_sexual').length === 1) {
          console.log('...性取向...');
          sexlove = $(v).children('span').last().text().trim();
        } else if ($(v).find('.ficon_relationship').length === 1) {
          console.log('...感情状况...');
          relationship = $(v).children('span').last().text().trim();
        } else if ($(v).find('.ficon_cd_coupon').length === 1) {
          console.log('...标签/友情链接...');
          let aas = $(v).find('a');
          let _data = [];
          aas.map((ii, vv) => {
            _data.push({
              name: $(vv).text().trim(),
              link: $(vv).attr('href').trim()
            });
          })
          $(v).find('span').first().remove();
          $(v).find('a').remove();
          let temp = $(v).text().trim();
          console.log(temp);
          switch (temp) {
            case '标签':
              tags = _data;
              break;
            case '友情链接':
              otherlinks = _data;
              break;
            default:
              console.error('未处理的链接标签');
              process.exit();
              break;
          }
        } else {
          console.error('...未做处理的用户信息...');
          console.error(script['html']);
          console.error($('li').html());
          console.error($(v).children('span').last().text().trim());
          process.exit();
        }
      })
      return { level, signature, address, birth, info, personallink, bloglink, baidu, education, industry, sexlove, relationship, tags, otherlinks }
    }
  } catch (error) {
    console.error(error);
  }
}

const parse_userrelationship = (script) => {
  try {
    if (script['domid'].match(/Pl_Core_T8CustomTriColumn__/)) {
      let $ = cheerio.load(script['html']);
      let tds = $('td');
      let follow, fan, microblog;
      tds.map((i, v) => {
        let text = $(v).text();
        if (text.includes('关注')) {
          follow = text.replace(/\D/g, '');
        } else if (text.includes('粉丝')) {
          fan = text.replace(/\D/g, '');
        } else {
          microblog = text.replace(/\D/g, '');
        }
      })
      return { follow, fan, microblog }
    }
  } catch (error) {
    console.error(error);
  }
}

const parse_userfollow = (script) => {
  try {
    let $ = cheerio.load(script['html']);
    let lis = $('li.follow_item');
    let users = lis.map((i, v) => {
      let data = $(v).attr('action-data');
      let id = data.match(/uid\=(\d+)\&/)[1];
      let username = data.match(/fnick\=([^&]+)\&/)[1];
      let match = data.match(/\&sex\=(\w+)/)[1];
      let sex, follow, fan, microblog;
      if (match.toLowerCase() === 'm') {
        sex = 1;
      } else if (match.toLowerCase() === 'f') {
        sex = 2;
      } else {
        process.exit();
      }
      let spans = $(v).find('.info_connect span');
      spans.map((ii, vv) => {
        let text = $(vv).text(),
          count = text.replace(/\D/g, '');
        if (text.includes('关注')) {
          follow = count;
        } else if (text.includes('粉丝')) {
          fan = count;
        } else if (text.includes('微博')) {
          microblog = count;
        }
      })
      let address = $(v).find('.info_add span').text();
      let signature = $(v).find('.info_intro span').text();
      let from = $(v).find('.info_from a').text();
      return {
        id, username, sex, follow, fan, microblog, address, signature, from
      }
    })
    return users;
  } catch (error) {
    console.error(error);
  }
}


const crawl_weiboer_byid = async (id) => {
  try {
    console.log(id);
    let uri = `http://weibo.com/u/${id}?is_all=1&sudaref=weibo.com&retcode=6102`;
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2814765473589.067.1484875273060; UM_distinctid=15bad72a54e0-00d24291aaf45a-143e655c-1aeaa0-15bad72a54fbcd; _s_tentry=baike.baidu.com; Apache=7379909336866.972.1494990148978; ULV=1494990149138:24:4:1:7379909336866.972.1494990148978:1494582703733; YF-Ugrow-G0=ad83bc19c1269e709f753b172bddb094; YF-V5-G0=5f9bd778c31f9e6f413e97a1d464047a; YF-Page-G0=091b90e49b7b3ab2860004fba404a078; SSOLoginState=1495518028; login_sid_t=b369960338a09b7d9555a79cddb2a7b2; WBtopGlobal_register_version=4641949e9f3439df; wvr=6; SCF=AtsqdIRs1koTLva1VnsJpX-bIJ1gGWgh3aR67Hj41UVxudrO_U6jQ606aUasOnS1ofkBtar4s-j0jQoDhiQty6Q.; SUB=_2A250M-GPDeRhGeBO61IQ9yvEyT2IHXVXSVRHrDV8PUNbmtBeLUPVkW9-y_LcjSMOmjep_pmoj7n9tZFkjA..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5KMhUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0LcizStCraDvHy; ALF=1528350045; UOR=,,login.sina.com.cn'
      }
    }
    let body = await rp(options);
    // console.log(body);
    let $ = cheerio.load(body);
    let scripts = $('script');
    console.log(scripts.length);
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
      console.log(i);
      // console.log(v);
      let key = v['domid'];
      switch (true) {
        case /Pl_Official_Headerv6__/.test(key):
          console.log('...页头信息...');
          let userhead = parse_userhead(v);
          console.log(userhead);
          break;
        case /Pl_Core_UserInfo__/.test(key):
          console.log('...用户信息...');
          let userinfo = parse_userinfo(v);
          console.log(userinfo);
          break;
        case /Pl_Core_T8CustomTriColumn__/.test(key):
          console.log('...用户关系...');
          let userrelationship = parse_userrelationship(v);
          console.log(userrelationship);
          break;
        case /Pl_Official_MyProfileFeed__/.test(key):
          console.log('...微博内容...');
          break;

        case /pl_common_top/.test(key):
          console.log('...顶部导航...');
          break;
        case /pl_common_footer/.test(key):
          console.log('...页脚信息...');
          break;
        case /plc_frame/.test(key):
          console.log('...页面框架...');
          break;
        case /plc_main/.test(key):
          console.log('...内容结构...');
          break;
        case /Pl_Official_Nav__/.test(key):
          console.log('...二级导航...');
          break;
        case /Pl_Core_PicText__/.test(key):
          console.log('...二级导航作品...');
          break;
        case /Pl_Core_CustTab__/.test(key):
          console.log('...二级导航服务...');
          break;
        case /Pl_Official_LikeMerge__/.test(key):
          console.log('...点赞微博...');
          break;
        case /Pl_Core_UserGrid__/.test(key):
          console.log('...微关系...');
          break;
        case /Pl_Core_FansGroups__/.test(key):
          console.log('...粉丝群...');
          break;
        case /Pl_Core_RecommendFeed__/.test(key):
          console.log('...相关推荐...');
          break;
        case /Pl_Third_Inline__/.test(key):
          console.log('...相册...');
          break;
        case /Pl_Official_TimeBase__/.test(key):
          console.log('...时间轴...');
          break;
        case /Pl_Core_Ut1UserList__/.test(key):
          console.log('...粉丝也关注...');
          break;
        case /Pl_Core_Pt13PicText__/.test(key):
          console.log('...文章...');
          break;
        case /Pl_Core_Pt6Rank__/.test(key):
          console.log('...乐迷榜...');
          break;
        case /Pl_Core_P6Video__/.test(key):
          console.log('...视频...');
          break;
        case /Pl_Core_PicTextList__/.test(key):
          console.log('...视频...');
          break;
        case /Pl_Core_P7MultiPicPlay__/.test(key):
          console.log('...图片墙...');
          break;
        case /Pl_Core_PicTextMixed__/.test(key):
          console.log('...橱窗...');
          break;

        case /Pl_Core_Pt6Rank__/.test(key):
        case /Pl_Official_ProfileFeedNav__/.test(key):
          console.log(v['domid']);
          console.log('...不知道什么鬼...');
          break;

        default:
          console.error('...未做处理的script标签...');
          console.error(v['domid']);
          console.error(v);
          process.exit();
          break;
      }
    })
    console.log(scripts.length);
  } catch (error) {
    console.error(error);
  }
}

const crawl_weiboer_byuri = async (uri) => {
  try {
    console.log(uri);
    let weibo_id = await crawl_weiboid_byuri(uri);
    await crawl_weiboer_byid(weibo_id);
  } catch (error) {
    console.error(error);
  }
}

// http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&from=myfollow_all&is_all=1&pagebar=0&pl_name=Pl_Official_MyProfileFeed__22&id=1005052285119444&script_uri=/dotacold&feed_type=0&page=1&pre_page=1&domain_op=100505&__rnd=1497011591262
// http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&profile_ftype=1&script_uri=/u/#{weiboer_id}&is_all=1&pre_page=#{pre_page}&page=#{page}&id=#{long_id}&pagebar=#{pagebar}&feed_type=0&__rnd=#{(new Date()).getTime()}&pl_name=Pl_Official_MyProfileFeed__24&domain_op=100505

const parse_articles = (body) => {
  try {
    let articles = [];
    let $ = cheerio.load(body);
    let divs = $('.WB_detail');
    divs.map((i, v) => {
      let referer;
      let _divs = $(v).find('.WB_expand');
      if (_divs.length === 1) {
        let aa = _divs.children('.WB_info').children('a').first();
        let nickname = aa.attr('nick-name');
        let article_id = aa.attr('suda-uatrack').match(/transuser\_nick\:(\d*)/)[1];
        let user_id = aa.attr('usercard').match(/id\=(\d*)/)[1];
        let content = _divs.children('.WB_text').text().trim();
        let aas = _divs.children('.WB_text').children('a');
        let address, topics = [], atnames = [];
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
        let summary = _divs.children('.WB_text').text().trim();
        aas = _divs.find('.WB_from').children('a');
        let publish_time = new Date(aas.first().attr('title'));
        let uri = 'http://weibo.com' + aas.first().attr('href');
        let publish_source;
        if (aas.length === 2) {
          publish_source = aas.last().text().trim();
        }
        let lis = _divs.find('.WB_handle').find('li');
        let repost = lis.first().text().replace(/\D/g, '');
        let comment = lis.eq(1).text().replace(/\D/g, '');
        let like = lis.last().text().replace(/\D/g, '');
        let article = {
          nickname,
          user_id,
          article_id,
          uri,
          content,
          summary,
          address,
          topics,
          atnames,
          publish_time,
          publish_source,
          repost,
          comment,
          like
        }
        referer = article_id;
        articles.push(article);
        _divs.remove();
      }
      let user_id = $(v).parent().parent().attr('tbinfo').match(/ouid\=(\d*)/)[1];
      let article_id = $(v).parent().parent().attr('mid');
      let aa = $(v).children('.WB_info').children('a').first();
      let nickname = aa.text().trim();
      let aas = $(v).find('.WB_from').children('a');
      let publish_time = new Date(aas.first().attr('title'));
      let uri = 'http://weibo.com' + aas.first().attr('href');
      let publish_source;
      if (aas.length === 2) {
        publish_source = aas.last().text().trim();
      }
      let content = $(v).children('.WB_text').text().trim();
      aas = $(v).children('.WB_text').children('a');
      let address, topics = [], atnames = [];
      aas.map((i, v) => {
        let usercard = $(v).attr('usercard');
        let extra = $(v).attr('extra-data');
        let text = $(v).text().trim();
        if ($(v).find('.ficon_cd_place').length === 1) {
          address = text.slice(1);
        } else if (/type=topic/.test(extra) || /type=topic/.test(usercard)) {
          topics.push(text);
        } else if (/type=atname/.test(extra) || /type=atname/.test(usercard)) {
          atnames.push(text);
        } else if ($(v).find('.ficon_cd_img').length === 1) {
          console.log('图片内容');
        } else {
          // console.log($(v).html());
          // console.log($(v).text());
        }
      })
      aas
      aas.remove();
      let summary = $(v).children('.WB_text').text().trim();
      let lis = $(v).parent().parent().find('.WB_handle').find('li');
      let repost = lis.eq(1).text().replace(/\D/g, '');
      let comment = lis.eq(2).text().replace(/\D/g, '');
      let like = lis.last().text().replace(/\D/g, '');
      let article = {
        nickname,
        user_id,
        article_id,
        uri,
        content,
        summary,
        address,
        topics,
        atnames,
        publish_time,
        publish_source,
        repost,
        comment,
        like,
        referer
      }
      articles.push(article);
    })
    // console.log(articles);
    return articles;
  } catch (error) {
    console.error(error);
  }
}

const crawl_articles_byid = async (id, username, page) => {
  try {
    console.log(id);
    let DOMAIN = '100505';
    let sub_pages = [0, 1, 2];
    let status = 0, results = [];

    // page = 1
    // http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&refer_flag=0000015010_&from=feed&loc=nickname&is_all=1&pagebar=0&pl_name=Pl_Official_MyProfileFeed__22&id=1005052285119444&script_uri=/dotacold&feed_type=0&page=1&pre_page=0&domain_op=100505&__rnd=1497104412135
    // http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&refer_flag=0000015010_&from=feed&loc=nickname&is_all=1&pagebar=0&pl_name=Pl_Official_MyProfileFeed__22&id=1005052285119444&script_uri=/dotacold&feed_type=0&page=1&pre_page=1&domain_op=100505&__rnd=1497104412135
    // http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&refer_flag=0000015010_&from=feed&loc=nickname&is_all=1&pagebar=1&pl_name=Pl_Official_MyProfileFeed__22&id=1005052285119444&script_uri=/dotacold&feed_type=0&page=1&pre_page=1&domain_op=100505&__rnd=1497104412135
    // page = 2
    // http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&refer_flag=0000015010_&from=feed&loc=nickname&is_all=1&pagebar=0&pl_name=Pl_Official_MyProfileFeed__22&id=1005052285119444&script_uri=/dotacold&feed_type=0&page=2&pre_page=1&domain_op=100505&__rnd=1497104412135
    // http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&refer_flag=0000015010_&from=feed&loc=nickname&is_all=1&pagebar=0&pl_name=Pl_Official_MyProfileFeed__22&id=1005052285119444&script_uri=/dotacold&feed_type=0&page=2&pre_page=2&domain_op=100505&__rnd=1497104412135
    // http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&refer_flag=0000015010_&from=feed&loc=nickname&is_all=1&pagebar=1&pl_name=Pl_Official_MyProfileFeed__22&id=1005052285119444&script_uri=/dotacold&feed_type=0&page=2&pre_page=2&domain_op=100505&__rnd=1497104412135

    for (let sub_page of sub_pages) {
      let pagebar = 0, pre_page = page - 1;
      if (sub_page !== 0) {
        pagebar = sub_page - 1;
        pre_page = page;
      }
      let uri = `http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=${DOMAIN}&refer_flag=0000015010_&from=feed&loc=nickname&is_all=1&pagebar=${pagebar}&pl_name=Pl_Official_MyProfileFeed__22&id=${DOMAIN}${id}&script_uri=/${username}&feed_type=0&page=${page}&pre_page=${pre_page}&domain_op=${DOMAIN}&__rnd=${Date.now()}`;
      console.log(uri);
      let options = {
        url: uri,
        method: 'GET',
        // gzip: true,
        timeout: 1000 * 60 * 2,
        headers: {
          "Host": 'weibo.com',
          "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
          "Cookie": 'SINAGLOBAL=2814765473589.067.1484875273060; UM_distinctid=15bad72a54e0-00d24291aaf45a-143e655c-1aeaa0-15bad72a54fbcd; _s_tentry=baike.baidu.com; Apache=7379909336866.972.1494990148978; ULV=1494990149138:24:4:1:7379909336866.972.1494990148978:1494582703733; YF-Ugrow-G0=ad83bc19c1269e709f753b172bddb094; YF-V5-G0=5f9bd778c31f9e6f413e97a1d464047a; YF-Page-G0=091b90e49b7b3ab2860004fba404a078; SSOLoginState=1495518028; login_sid_t=b369960338a09b7d9555a79cddb2a7b2; WBtopGlobal_register_version=4641949e9f3439df; wvr=6; SCF=AtsqdIRs1koTLva1VnsJpX-bIJ1gGWgh3aR67Hj41UVxudrO_U6jQ606aUasOnS1ofkBtar4s-j0jQoDhiQty6Q.; SUB=_2A250M-GPDeRhGeBO61IQ9yvEyT2IHXVXSVRHrDV8PUNbmtBeLUPVkW9-y_LcjSMOmjep_pmoj7n9tZFkjA..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5KMhUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0LcizStCraDvHy; ALF=1528350045; UOR=,,login.sina.com.cn'
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
      let articles = parse_articles(data.data);
      // console.log(articles);
      console.log(articles.length);
      results = results.concat(articles);
      let $ = cheerio.load(data.data);
      // console.log(body);
      // 下一页
      if ($('a.next').last().text() === '下一页') {
        status = 1;
      }
    }
    console.log(status);
    console.log(results.length);
    return {
      status,
      results
    }
  } catch (error) {
    console.error(error);
  }
}

const crawl_articles_byuri = async (uri, page) => {
  try {
    let id = await crawl_weiboid_byuri(uri);
    let articles = await crawl_articles_byid(id, '', page);
    console.log(articles);
  } catch (error) {
    console.error(error);
  }
}

// http://weibo.com/p/1005052285119444/follow?pids=Pl_Official_HisRelation__60&page=2&ajaxpagelet=1&ajaxpagelet_v6=1&__ref=%2Fp%2F1005052285119444%2Ffollow%3Ffrom%3Dpage_100505%26wvr%3D6%26mod%3Dheadfollow%23place&_t=FM_149726538665034
// http://weibo.com/p/1005052285119444/follow?pids=Pl_Official_HisRelation__60&page=2&ajaxpagelet=1&ajaxpagelet_v6=1&__ref=/p/1005052285119444/follow?from=page_100505&wvr=6&mod=headfollow#place&_t=FM_149726538665034
/**
 *  只能看前 5 页
 */
const crawl_follows_byid = async (id, page) => {
  try {
    if (page >= 5) {
      return {
        status: 0,
        follows: []
      }
    }
    let status = 0;
    let uri = `http://weibo.com/p/100505${id}/follow?pids=Pl_Official_HisRelation__60&page=${page}&ajaxpagelet=1&ajaxpagelet_v6=1&__ref=/p/100505${id}/follow?from=page_100505&wvr=6&mod=headfollow#place&_t=FM_${Date.now()}`;
    console.log(uri);
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2814765473589.067.1484875273060; UM_distinctid=15bad72a54e0-00d24291aaf45a-143e655c-1aeaa0-15bad72a54fbcd; _s_tentry=baike.baidu.com; Apache=7379909336866.972.1494990148978; ULV=1494990149138:24:4:1:7379909336866.972.1494990148978:1494582703733; YF-Ugrow-G0=ad83bc19c1269e709f753b172bddb094; YF-V5-G0=5f9bd778c31f9e6f413e97a1d464047a; YF-Page-G0=091b90e49b7b3ab2860004fba404a078; SSOLoginState=1495518028; login_sid_t=b369960338a09b7d9555a79cddb2a7b2; WBtopGlobal_register_version=4641949e9f3439df; wvr=6; UOR=,,login.sina.com.cn; SCF=AtsqdIRs1koTLva1VnsJpX-bIJ1gGWgh3aR67Hj41UVxa-1z07wlpmxpRHvT9uhccXlpq0U7GFda-uMiIIW3wgk.; SUB=_2A250Ol_GDeRhGeBO61IQ9yvEyT2IHXVXTjYOrDV8PUNbmtBeLRL4kW8D0BRgV_59PqS1gXFmtSki2atbZA..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5KMhUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0rrL07k8Jb8gSq; ALF=1528783636; WBStorage=5ea47215d42b077f|undefined'
      }
    }
    let body = await rp(options);
    let match = body.match(reg_location);
    if (match) {
      options.url = match[1];
      body = await rp(options);
    }
    // console.log(body);
    match = body.match(reg_fm);
    let script;
    if (match) {
      script = JSON.parse(match[1]);
    }
    let follows = parse_userfollow(script);
    let $ = cheerio.load(script['html']);
    if ($('a.next').length === 1 && $('.next').text() === '下一页') {
      status = 1;
    }
    // console.log(status);
    // console.log(follows);
    // console.log(follows.length);
    return {
      status,
      follows
    }
  } catch (error) {
    console.error(error);
  }
}

const crawl_fans_byid = async (id, page) => {
  try {
    if (page >= 5) {
      return {
        status: 0,
        fans: []
      }
    }
    let status = 0;
    let uri = `http://weibo.com/p/100505${id}/follow?pids=Pl_Official_HisRelation__60&relate=fans&page=${page}&ajaxpagelet=1&ajaxpagelet_v6=1&__ref=/p/100505${id}/follow?relate=fans&from=100505&wvr=6&mod=headfans#place&_t=FM_${Date.now()}`;
    console.log(uri);
    let options = {
      url: uri,
      method: 'GET',
      // gzip: true,
      timeout: 1000 * 60 * 2,
      headers: {
        "Host": 'weibo.com',
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        "Cookie": 'SINAGLOBAL=2814765473589.067.1484875273060; UM_distinctid=15bad72a54e0-00d24291aaf45a-143e655c-1aeaa0-15bad72a54fbcd; _s_tentry=baike.baidu.com; Apache=7379909336866.972.1494990148978; ULV=1494990149138:24:4:1:7379909336866.972.1494990148978:1494582703733; YF-Ugrow-G0=ad83bc19c1269e709f753b172bddb094; YF-V5-G0=5f9bd778c31f9e6f413e97a1d464047a; YF-Page-G0=091b90e49b7b3ab2860004fba404a078; SSOLoginState=1495518028; login_sid_t=b369960338a09b7d9555a79cddb2a7b2; WBtopGlobal_register_version=4641949e9f3439df; wvr=6; UOR=,,login.sina.com.cn; SCF=AtsqdIRs1koTLva1VnsJpX-bIJ1gGWgh3aR67Hj41UVxa-1z07wlpmxpRHvT9uhccXlpq0U7GFda-uMiIIW3wgk.; SUB=_2A250Ol_GDeRhGeBO61IQ9yvEyT2IHXVXTjYOrDV8PUNbmtBeLRL4kW8D0BRgV_59PqS1gXFmtSki2atbZA..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWauxJAp_Sb5HC3ovdO-gxG5JpX5KMhUgL.Foq7eh5pS0-Reo22dJLoI7DB-XHkMcvadJ94; SUHB=0rrL07k8Jb8gSq; ALF=1528783636; WBStorage=5ea47215d42b077f|undefined'
      }
    }
    let body = await rp(options);
    let match = body.match(reg_location);
    if (match) {
      options.url = match[1];
      body = await rp(options);
    }
    // console.log(body);
    match = body.match(reg_fm);
    let script;
    if (match) {
      script = JSON.parse(match[1]);
    }
    let fans = parse_userfollow(script);
    let $ = cheerio.load(script['html']);
    if ($('a.next').length === 1 && $('.next').text() === '下一页') {
      status = 1;
    }
    // console.log(status);
    // console.log(fans.length);
    // console.log(fans);
    return {
      status,
      fans
    }
  } catch (error) {
    console.error(error);
  }
}

// let uri = 'http://weibo.com/u/6000175821/home#_0';
// crawl_weiboid_byuri(uri);
// crawl_weiboer_byid(1239246050);
// crawl_weiboer_byuri('http://weibo.com/kujian?refer_flag=0000015010_&from=feed&loc=nickname&is_all=1');
// crawl_weiboer_byuri(process.argv[2]);
// crawl_articles_byid(2285119444, 'dotacold', 12);
// crawl_articles_byuri('http://weibo.com/tongdaodashu?refer_flag=0000015010_&from=feed&loc=nickname', 1);
// crawl_follows_byid(2285119444, 1);
// crawl_fans_byid(2285119444, 1);
