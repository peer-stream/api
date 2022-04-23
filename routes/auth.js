const express = require('express');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { serialize } = require('cookie');
const { ethers } = require('ethers');
const jwtVerify = require('../utils/jwt_middleware');
const buildMessage = require('../utils/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/me', jwtVerify, async (req, res) => {
  res.json(req.user);
});

router.post('/nonce', async function(req, res, next) {
  const { address } = req.body;

  if (!address || address.length < 42) {
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

router.post('/token', async function(req, res, next) {
  const { address, signature } = req.body;

  if (!address || address.length < 42 || !signature || signature.length < 32) {
    return res.status(400).json({ message: 'a valid wallet address and signature are required' });
  }

  try {
    const user = await User.findOne({ wallet_address: address }).select('auth_nonce');

    if (!user) {
      return res.status(400).json({ message: 'bad request' });
    }

    // verify the signature
    const decodedAddress = await ethers.utils.verifyMessage(buildMessage(address, user.auth_nonce), signature);

    if (!decodedAddress || address.toLowerCase() !== decodedAddress.toLowerCase()) {
      return res.status(400).json({ message: 'invalid signature' });
    }

    // update user's nonce
    user.auth_nonce = nanoid();
    await user.save();

    // generate jwt
    const issued = Date.now();
    const expires = issued + 1000 * 60 * 60 * 24 * 30; // 7 days
    const jwtPayload = {
      sub: user._id,
      iat: issued,
      exp: expires,
      aud: "https://peerstream.io",
      iss: "https://peerstream.io"
    };

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET);

    res.setHeader(
      'Set-Cookie',
      serialize('access_token', jwtToken, {
        path: '/',
        secure: true,
        expires: new Date(expires),
        sameSite: true,
        httpOnly: true
      })
    );

    res.status(201).json({ token: jwtToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
