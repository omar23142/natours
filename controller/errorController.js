// const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const AppError = require('../utils/appError');

const SendErrorDev = (err, req, res) => {
  if(req.originalUrl.startsWith('/api')) {
    console.error(err);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      errorStack: err.stack,
      message: err.message,
    });
  }
  else 
    res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message 
})
  
};
const SendErrorPro = (err, req, res) => {
  if(req.originalUrl.startsWith('/api')) {
  if (err.isOperational) {
    console.error(err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: 'Internal Error',
      message: 'somthing went roung!',
    });
  }
} else {
  if (err.isOperational) {
    console.error(err);
    //console.log('thisistesssst' , err.message )
    res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  } else {
    console.error(err);
    res.status(500).render('error', {
      title: 'Internal Error',
      msg: 'somthing went roung!',
    });
  }
}
};
const CastErrorDB = (err) => {
  err.message = `Invalid ${err.path} with value : ${err.value}`;
  return new AppError(400, err.message);
};
const DublicatedErrDB = (err) => {
  // console.log(err.message);
  // const val = err.message.match(/"(?:[^"\\]|\\.)*"/);
  // console.log('vallllll',val);
  console.log(JSON.stringify(err.keyValue.name));
  err.message = `duplicated key : this name : ${JSON.stringify(
    err.keyValue.name,
  )} is already exist pleas enter another key `;
  return new AppError(400, err.message);
};

const ValidationErrDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  console.log(errors);
  err.message = `Invalid Input data${errors}`;
  return new AppError(400, err.message);
};
const JsonWebTokenError = () =>
  new AppError(401, 'Invalid token pleas sig in again ');
const TokenExpiredError = () =>
  new AppError(401, 'the token is expired pleas log in again');

module.exports = (err, req, res, next) => {
  //console.log('this is env test',process.env.NODE_ENV)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    SendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //console.log('production');
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message;
    //console.log('======',err)
    //console.log('+++++', error)
    if (error.name === 'CastError') error = CastErrorDB(error);
    if (error.code === 11000) {
      //console.log(true);
      error = DublicatedErrDB(error);
    }
    if (error.name === 'ValidationError') error = ValidationErrDB(error);
    if (error.name === 'JsonWebTokenError') error = JsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = TokenExpiredError();
    SendErrorPro(error, req, res);
  }
};
