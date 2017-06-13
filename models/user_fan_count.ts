import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FanCountSchema = new Schema({
  user_id: {
    type: String,
  },
  // 昵称
  user_name: {
    type: String,
  },
  // 关注数
  user_follows: {
    type: Number,
  },
  // 粉丝数
  user_fans: {
    type: Number,
  },
  // 微博数
  user_microblogs: {
    type: Number,
  },
  // 等级
  user_level: {
    type: Number,
  },
  create_time: {
    type: Date,
  }
})

const FanCountModel = mongoose.model('FANCOUNT', FanCountSchema, 'sina_fan_counts');
export { FanCountModel }