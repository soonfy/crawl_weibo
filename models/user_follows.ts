import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
  _id: {
    type: String, // user_id@follow_id
  },
  user_id: {
    type: String,
  },
  follow_id: {
    type: String,
  },
  approach: {
    type: String,
  },
  create_time: {
    type: Date,
  }
})

FollowSchema.static('updateFollow', async (follows) => {
  let promises = follows.map(async (x) => {
    try {
      let _follow = {
        _id: `${x.fromid}@${x.uid}`,
        user_id: x.fromid,
        follow_id: x.uid,
        approach: x.from,
        create_time: new Date()
      }
      return await FollowModel.create(_follow);
    } catch (error) {
      if (error.code !== 11000) {
        console.error(error);
        return error.message;
      } else {
        return 'E11000 duplicate key';
      }
    }
  })
  let resp = await Promise.all(promises);
  return resp;
})

const FollowModel = mongoose.model('FOLLOW', FollowSchema, 'sina_follows');
export { FollowModel }