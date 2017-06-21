import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TopicSchema = new Schema({
  _id: {
    type: String
  },
  topic_name: {
    type: String
  },
  topic_uri: {
    type: String
  },
  topic_mc: {
    type: String
  },
  mc_uri: {
    type: String
  },
  topic_read: {
    type: Number
  },
  create_time: {
    type: Date,
  },
})

const TopicModel = mongoose.model('TOPIC', TopicSchema, 'sina_topics');
export { TopicModel }
