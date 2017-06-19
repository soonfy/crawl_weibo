import * as weiboTopicCrawler from './crawlers/weibo_topic';

// import * as Config from './config';
// console.log('mongodb url -->', Config.DBURL);

const crawl_topics = async () => {
  try {
    let topics = await weiboTopicCrawler.crawl_tag();
    console.log(topics);
    for (let tag of topics) {
      let page = 1;
      let data = await weiboTopicCrawler.crawl_topics_bytag(tag, page);
      while (data.status === 1) {
        console.log('tag', tag);
        console.log('page', page);
        for (let topic of data.topics) {
          console.log(topic);
        }
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