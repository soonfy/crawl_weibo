import * as mongoose from 'mongoose';

let DBURL;
if (process.argv[2] && process.argv[2].includes('mongodb')) {
  DBURL = process.argv[2] ? process.argv[2].trim() : '';
} else {
  console.error('没有数据库地址。使用默认本地连接。');
  DBURL = 'mongodb://localhost/weibo';
  // process.exit();
}

mongoose.connect(DBURL);
const connection = mongoose.connection;
connection.on('connected', () => {
  console.log(`conected dburl ${DBURL}`);
  console.log(`conected db ${connection.db.databaseName}`);
  let collections = connection.collections;
  for (let coll in collections) {
    console.log(`conected collection ${coll}`);
  }
})

export {
  DBURL
}