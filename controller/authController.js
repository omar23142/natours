const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const User = require('../models/usermodule');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/mail');

const sendToken = (res, user, statusCode) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'prodction') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user: user,
      token: token,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConf: req.body.passwordConf,
    passChangAt: req.body.passChangAt,
    //role:req.body.role
  });
  const url =`${req.protocol}://${req.get('host')}/me`;
  await new Email( newUser, url).sendWilcome();
  //console.log('testtttttt',newUser._id);
  newUser.password = undefined;
  newUser.active = undefined;
  sendToken(res, newUser, 201);
});

exports.sigin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if the email and pass is exist on the req.body
  if (!email || !password)
    return next(new AppError(400, 'please provide email and password'));
  // check if the email is exist and the pass is correct
  const freshUser = await User.findOne({ email: email }).select('+password');
  if (!freshUser || !(await freshUser.checkPass(password, freshUser.password)))
    return next(new AppError(401, 'the email or password is incorrect'));
  // send the token
  sendToken(res, freshUser, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 check if the req.body has the token
  res.locals.user = undefined;
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError(401, 'there is no token pleas login '));
  }
  // 2 verification of the token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  // 3 check if the user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError(
        401,
        'the user belong to this token is not exist any more please log in again',
      ),
    );
  // 4 check if the user modifiy his pass after the token was issued
  const changed = freshUser.passChangedAfter(decoded.iat);
  if (changed)
    return next(
      new AppError(
        401,
        'the passwrd was changed after the token issued pleas log in again ',
      ),
    );
  // GAIN ACCESS TO THE PROTECT ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLogedin = async (req, res, next) => {
  // 1 check if the req.cookie has the token
 try {
  //console.log('in the is logeddddddddddddin ')
  let token = undefined;
  res.locals.user = undefined;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  
  if (!token) {
    return next();
  }
  // 2 verification of the token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  // 3 check if the user still exist      
  const currentUser = await User.findById(decoded.id);       
  if (!currentUser)  
    return next();       
  // 4 check if the user modifiy his pass after the token was issued        
  const changed = currentUser.passChangedAfter(decoded.iat);        
  if (changed)        
    return next();        
  // THE USER IS LOGGED IN         
  res.locals.user = currentUser;      
  return next();   
}} catch(err) {  
  console.error(err)
  return next();
}
next();
};


exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) next();
    else return next(new AppError(403, 'you are not allowed to do this '));
  };

exports.forgetPass = catchAsync(async (req, res, next) => {
  // 1 get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError(404, 'there is no user with this email'));
  // 2 generate the random reset token
  const resetToken = user.creatResetPassToken();
  await user.save();
  // 3 send it to the user email
  try {

    // const message = `if you forget your password submit PATCH request with your new password and passwordConfirm to ${
    //   resetURL
    // }.\n if you not forget your password pleas ignore this email`;
    // await sendMail({
    //   name: user.name,
    //   email: user.email,
    //   subject: 'your password reset token is valid for 10 min ',
    //   message,
    // });
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendResetPass();

    res.status(200).json({
      status: 'success',
      message: 'your email is sent ',
    });
  } catch (err) {
    user.PassResetToken = undefined;
    user.PassResetTokenExpire = undefined;
    await user.save();
    console.error(err);
    return next(
      new AppError(500, 'there is error happen when sending the email'),
    );
  }
});

exports.resetPass = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    PassResetToken: hashedResetToken,
    PassResetTokenExpire: { $gt: Date.now() },
  });
  // 2) if there is a user and the token is not expired => set new pass
  if (!user) return next(new AppError(400, 'token is Invalid or has expired'));
  user.password = req.body.password;
  user.passwordConf = req.body.passwordConf;
  user.PassResetToken = undefined;
  user.PassResetTokenExpire = undefined;
  await user.save();
  //console.log(user);
  // 3) update the changePasswordAt for the current user
  // 4) sigin user
  sendToken(res, user, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 get user from collections
  const user = await User.findById(req.user.id).select('+password');

  // 2 check if posted current password is correct
  if (!(await user.checkPass(req.body.passwordCurrent, user.password)))
    return next(new AppError(401, 'the password is incorrect pleas try again'));
  // 3 if so update pass
  user.password = req.body.password;
  user.passwordConf = req.body.passwordConf;
  await user.save();
  // 4 log user in send jwt
  sendToken(res, user, 200);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'out', {
    httpOnly:true,
    expires: new Date(Date.now() + 10 * 1000)
  });
  res.status(200).json({
    status:'success'
  })
}

