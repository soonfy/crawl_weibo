import * as _ from 'lodash';
import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

import { FanCountModel } from './user_fan_count';

const UserSchema = new Schema({
  // 微博id
  _id: {
    type: String,
  },
  // 昵称
  name: {
    type: String,
  },
  // 个性签名
  signature: {
    type: String,
  },
  // 性别
  sex: {
    type: Number, // 1 - m, 2 - f
  },
  // 关注数
  follows: {
    type: Number,
  },
  // 粉丝数
  fans: {
    type: Number,
  },
  // 微博数
  microblogs: {
    type: Number,
  },
  // 等级
  level: {
    type: Number,
  },
  // 地址
  address: {
    type: String,
  },
  // 生日
  birth: {
    type: String,
  },
  // 简介
  info: {
    type: String,
  },
  // 个性域名
  personalname: {
    type: Object,
  },
  // 个性链接
  personallink: {
    type: String,
  },
  // 博客链接
  bloglink: {
    type: String,
  },
  // 百度百科
  baidu: {
    type: String,
  },
  // 教育
  education: {
    type: String,
  },
  // 行业
  industry: {
    type: String,
  },
  // 性取向
  sexlove: {
    type: String,
  },
  // 感情状况
  relationship: {
    type: String,
  },
  // 标签
  tags: {
    type: Array,
  },
  // 友情链接
  otherlinks: {
    type: Array,
  },
  create_time: {
    type: Date,
    default: new Date
  },
  update_time: {
    type: Date,
    default: new Date
  }
})

UserSchema.static('updateUser', async (user) => {
  let _user = await UserModel.findOne({ _id: user._id });
  // console.log('old user --> \r\n', _user);
  let date = new Date();
  if (!_user) {
    _user = _.assign(_user, { create_time: date });
  }
  _user = _.assign(_user, user, { update_time: date });
  _user = await UserModel.findOneAndUpdate({ _id: _user._id }, { $set: _user }, { upsert: true, new: true });
  // console.log('new user --> \r\n', _user);
  return _user;
})

UserSchema.static('updateUserAndFan', async (user) => {
  let _user = await UserModel.findOne({ _id: user._id });
  // console.log('old user --> \r\n', _user);
  let date = new Date();
  if (!_user) {
    _user = _.assign(_user, { create_time: date });
  }
  _user = _.assign(_user, user, { update_time: date });
  _user = await UserModel.findOneAndUpdate({ _id: _user._id }, { $set: _user }, { upsert: true, new: true });

  let fan = {
    user_id: _user._id,
    user_name: _user.name,
    user_follows: _user.follows,
    user_fans: _user.fans,
    user_microblogs: _user.microblog,
    user_level: _user.level,
    create_time: new Date()
  };

  let _fan = await FanCountModel.create(fan);
  // console.log('store fan --> \r\n', _fan);
  return {
    user: _user,
    fan: _fan
  }
})

const UserModel = mongoose.model('USER', UserSchema, 'sina_users');
export { UserModel }