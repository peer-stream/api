const express = require('express');
const { nanoid } = require('nanoid');
const buildMessage = require('../utils/auth');
const User = require('../models/user');

const router = express.Router();

router.post('/nonce', async function(req, res, next) {
  const { address } = req.body;

  if (!address || address.length < 32) {
    return res.status(400).json({ message: 'a valid wallet address is required' });
  }

  try {
    let user = await User.findOne({ wallet_address: address }).select('auth_nonce');

    if (!user) {
      user = new User({ wallet_address: address });
    } else {
      user.auth_nonce = nanoid();
    }

    await user.save();

    res.json({
      address,
      message_to_sign: buildMessage(address, user.auth_nonce)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
