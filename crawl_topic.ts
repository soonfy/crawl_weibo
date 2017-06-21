import * as weiboTopicCrawler from './crawlers/weibo_topic';
import { TopicModel } from './models/topic';

import * as Config from './config';
console.log('mongodb url -->', Config.DBURL);
const sleep = async (ss) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ss * 1000);
  })
}

const crawl_topics = async () => {
  try {
    let topics = await weiboTopicCrawler.crawl_tag();
    topics = topics.slice(3);
    console.log(topics);
    for (let tag of topics) {
      let page = 1;
      let data = await weiboTopicCrawler.crawl_topics_bytag(tag, page);
      while (data && data.status === 1) {
        console.log('tag', tag);
        console.log('page', page);
        for (let topic of data.topics) {
          let _topic = {
            topic_name: topic.name,
            topic_uri: topic.uri,
            topic_mc: topic.mc,
            ma_uri: topic.ma_uri,
            topic_read: topic.read,
            create_time: new Date(),
          }
          _topic = await TopicModel.findOneAndUpdate({ topic_name: _topic.topic_name }, { $set: _topic }, { upsert: true, new: true });
          console.log(_topic);
        }
        let time = 30 + Math.random() * 30;
        console.log(`sleep ${time}s...`);
        await sleep(time);
        page++;
        data = await weiboTopicCrawler.crawl_topics_bytag(tag, page);
      }
    }
    console.log('all tags over.');
  } catch (error) {
    console.error(error);
  }
}

crawl_topics();