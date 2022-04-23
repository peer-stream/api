const assert = require('assert');
const mongoose = require('mongoose');

assert(process.env.MONGO_URI, 'MONGO_URI environment variable must be provided');

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

module.exports = connectDB;
