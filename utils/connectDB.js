const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // strict query syntax
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(
      //process.env.PROD ? process.env.MONGO_URI_PROD : process.env.MONGO_URI,
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
