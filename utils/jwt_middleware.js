const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyJwt = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(' ')[1];

    // try to get token from cookie if not exists in header
    if (!token) {
      const cookies = req.headers.cookie;

      if (cookies) {
        const cookie = cookies.split(';').find((c) => c.trim().startsWith('access_token='));

        if (cookie) {
          token = cookie.split('=')[1];
        }
      }
    }

    // try to get token from querystring if not exists in cookie as well
    if (!token) {
      token = req.query.access_token;
    }

    // if no token provided
    if (!token) {
      return res.status(401).json({
        error: 'no access token provided'
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        error: 'invalid token'
      });
    }

    // assign user id to request
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        error: 'invalid token'
      });
    }
    req.user = user;

    return next();
  }

module.exports = verifyJwt;
