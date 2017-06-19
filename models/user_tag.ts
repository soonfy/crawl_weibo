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

UserTagSchema.index({ user_id: 1, user_tag: 1 });

const UserTagModel = mongoose.model('USERTAG', UserTagSchema, 'sina_user_tags');
export { UserTagModel }