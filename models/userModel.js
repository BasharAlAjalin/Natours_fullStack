const mongoose = require("mongoose");
const validator = require("validator");
const { validate } = require("./tourModel");
const userScheema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, " User Name must be declared"],
  },
  email: {
    type: String,
    required: [true, "User Email must be declared"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid Email"],
  },
  password: {
    type: String,
    required: [true, " User Password must be declared"],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
  image: String,
});

const User = mongoose.model("User", userScheema);

module.exports = User;
