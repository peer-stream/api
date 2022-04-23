const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { nanoid } = require('nanoid');

const commentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => nanoid()
    },
    stream_id: {
      type: String,
      required: true,
      index: true
    },
    author_id: {
      type: String,
      required: true,
      index: true
    },
    body: {
      type: String,
      required: true
    }
  },
  {
    collection: 'comments',
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

commentSchema.plugin(mongoosePaginate);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
