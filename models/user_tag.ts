import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserTagSchema = new Schema({
  user_id: {
    type: String
  },
  user_tag: {
    type: String
  }
})

const UserTagModel = mongoose.model('USERTAG', UserTagSchema, 'sina_user_tags');
export { UserTagModel }