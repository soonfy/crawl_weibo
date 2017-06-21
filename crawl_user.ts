import * as _ from 'lodash';

import * as weiboUserCrawler from './crawlers/weibo_user';
import * as weiboTagCrawler from './crawlers/weibo_tag';

import { UserModel } from './models/user';
import { FollowModel } from './models/user_follows';
import { UserTagModel } from './models/user_tag';

import * as Config from './config';
console.log('mongodb url -->', Config.DBURL);


const crawl_userinfo = async (id) => {
  try {
    console.log('crawl weibo id -->', id);
    let user = await weiboUserCrawler.crawl_weiboer_byid(id);
    // console.log('crawl user ->\r\n', user);
    let _user = await UserModel.updateUser(user);
    // let data = await UserModel.updateUserAndFan(user);
    // console.log('store user and fan --> \r\n', data);
  } catch (error) {
    console.error(error);
  }
}

// crawl_userinfo('2285119444');

const crawl_userfollows = async (id) => {
  try {
    console.log('crawl weibo id -->', id);
    let data = await weiboUserCrawler.crawl_follows_byid(id, 1);
    let page = 1,
      follows = data.follows;
    while (data.status === 1) {
      ++page;
      console.log('crawl page --> ', page);
      data = await weiboUserCrawler.crawl_follows_byid(id, page);
      follows = _.concat(follows, data.follows);
    }
    follows = follows.map(x => {
      x.fromid = id;
      return x;
    });
    // console.log(follows);
    console.log(follows.length);
    let resp = await FollowModel.updateFollow(follows);
    // console.log(resp);
    return resp;
  } catch (error) {
    console.error(error);
  }
}

// crawl_userfollows('1400854834');

const crawl_userfans = async (id) => {
  try {
    console.log('crawl weibo id -->', id);
    let data = await weiboUserCrawler.crawl_fans_byid(id, 1);
    let page = 1,
      fans = data.fans;
    console.log(fans);
    while (data.status === 1) {
      ++page;
      console.log('crawl page --> ', page);
      data = await weiboUserCrawler.crawl_fans_byid(id, page);
      fans = _.concat(fans, data.fans);
    }
    fans = fans.map(x => {
      x.fromid = x.uid;
      x.uid = id;
      return x;
    });
    // console.log(fans);
    console.log(fans.length);
    let resp = await FollowModel.updateFollow(fans);
    // console.log(resp);
    return resp;
  } catch (error) {
    console.error(error);
  }
}

// crawl_userfans('2285119444');

const crawl_users = async (id) => {
  try {
    await crawl_userinfo(id);
    let follows = await crawl_userfollows(id);
    let fans = await crawl_userfans(id);
    for (let follow of follows) {
      if (typeof follow !== 'string') {
        await crawl_userinfo(follow.follow_id);
      }
    }
    for (let fan of fans) {
      if (typeof fan !== 'string') {
        await crawl_userinfo(fan.user_id);
      }
    }
    for (let follow of follows) {
      if (typeof follow !== 'string') {
        await crawl_users(follow.follow_id);
      }
    }
    for (let fan of fans) {
      if (typeof fan !== 'string') {
        await crawl_users(fan.user_id);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// crawl_users('1400854834');

const crawl_users_bytag = async () => {
  try {
    let tags = await weiboTagCrawler.crawl_tag();
    // console.log(tags);
    for (let tag of tags) {
      let page = 1;
      let data = await weiboUserCrawler.crawl_weiboers_bytag(tag, page);
      while (data.status === 1) {
        console.log('tag', tag);
        console.log('page', page);
        for (let user of data.users) {
          let temp = {
            user_id: user.id,
            user_tag: tag.name
          }
          await UserTagModel.findOneAndUpdate(temp, { $set: temp }, { upsert: true });
          await crawl_userinfo(user.id);
        }
        page++;
        data = await weiboUserCrawler.crawl_weiboers_bytag(tag, page);
      }
    }
    console.log('all tags over.');
  } catch (error) {
    console.error(error);
  }
}

// crawl_users_bytag();
