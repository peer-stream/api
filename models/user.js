const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => nanoid()
    },
    display_name: {
      type: String,
      default: ''
    },
    wallet_address: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      validate: (address) => {
        return /^0x([A-Fa-f0-9]{40})$/.test(address);
      }
    },
    auth_nonce: {
      type: String,
      default: () => nanoid(),
      required: true,
      unique: true,
      index: true,
      select: false
    }
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id
        delete ret.__v
        delete ret.auth_nonce

        ret.id = doc._id
      }
    }
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
