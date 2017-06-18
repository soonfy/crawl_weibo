import * as weiboArticleCrawler from './crawlers/weibo_article';

const crawl_article_repost = async (id) => {
  try {
    let data = await weiboArticleCrawler.crawl_repost(id, 1);
    let {pagenum,
      totalpage} = data;
    while (totalpage > pagenum) {
      console.log(pagenum);
      let _data = await weiboArticleCrawler.crawl_repost(id, ++pagenum);
      console.log(_data.articles.reposts[0]);
      data.articles.reposts = data.articles.reposts.concat(_data.articles.reposts);
      data.articles.hots = data.articles.hots.concat(_data.articles.hots);
      pagenum = _data.pagenum;
      console.log(data.articles.reposts.length);
    }
    console.log(data.articles.hots.length);
    console.log(data.articles.reposts.length);
    console.log(data.count);
  } catch (error) {
    console.error(error);
  }
}

crawl_article_repost('4118488912457944');
