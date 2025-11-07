const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//const catchAsync = require('../utils/catchAsync');

const userSchema = mongoose.Schema({
  name: { type: String, required: [true, 'pleas tell us your name'] },
  email: {
    type: String,
    unique: true,
    required: [true, 'pleas provide us your name'],
    lowercase: true,
    validate: [validator.isEmail, 'pleas provide us a valid email'],
  },
  photo: {type:String,
  default:'default.jpg'},
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'pleas provide a password'],
    minlenght: 8,
    maxlenght: 16,
    select: false,
  },
  passwordConf: {
    type: String,
    require: [true, 'pleas provide a confirme for the password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'the confirm password is not equals password',
    },
  },
  passChangAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  PassResetToken: String,
  PassResetTokenExpire: Date,
});

userSchema.pre('save', async function (next) {
  // check if only the modified happen on password (not on email for example)
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConf = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passChangAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

userSchema.methods.checkPass = async function (candidatePass, userPass) {
  let val;
  val = await bcrypt.compare(candidatePass, userPass);
  return val;
};
userSchema.methods.passChangedAfter = function (tokenTimestamp) {
  if (this.passChangAt) {
    const passChantAtTimestamp = this.passChangAt.getTime() / 1000;
    // console.log(tokenTimestamp, passChantAtTimestamp);
    return passChantAtTimestamp > tokenTimestamp;
  }

  return false;
};
userSchema.methods.creatResetPassToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.PassResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.PassResetTokenExpire = Date.now() + 10 * 60 * 1000;
  //console.log(this.PassResetToken, this.PassResetTokenExpire);
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
