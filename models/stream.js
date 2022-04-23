const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { nanoid } = require('nanoid');

const streamSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => nanoid()
    },
    owner_id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      index: true,
      default: 'Untitled'
    },
    description: {
      type: String
    },
    livepeer_id: {
      type: String,
      required: true,
      index: true
    },
    livepeer_stream_key: {
      type: String,
      required: true
    },
    livepeer_playback_id: {
      type: String,
      required: true
    }
  },
  {
    collection: 'streams',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id
        delete ret.__v

        ret.id = doc._id
        ret.rtmp_ingest_url = 'rtmp://rtmp.livepeer.com/live'
        ret.srt_ingest_url = `srt://rtmp.livepeer.com:2935?streamid=${doc.livepeer_stream_key}`
        ret.playback_url = `https://livepeercdn.com/hls/${doc.livepeer_playback_id}/index.m3u8`
      }
    }
  },
);

streamSchema.plugin(mongoosePaginate);

const Stream = mongoose.model('Stream', streamSchema);

module.exports = Stream;
