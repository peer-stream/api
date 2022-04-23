const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { nanoid } = require('nanoid');

const streamSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => nanoid()
    },
    title: {
      type: String,
      index: true,
      default: 'Untitled'
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
      }
    }
  },
);

streamSchema.plugin(mongoosePaginate);

const Stream = mongoose.model('Stream', streamSchema);

module.exports = Stream;
