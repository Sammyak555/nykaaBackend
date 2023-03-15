const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect(process.env.mongoURL);

mongoose.set("strictQuery",true);

module.exports = {
  connection,
};
