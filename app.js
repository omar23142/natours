

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
//const fs = require('fs');
//const { get } = require('http');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
//const mongoSanitize = require('express-mongo-sanitize');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize');
//const xss = require('xss-clean');
const xssSanitize = require('xss-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const globalErrorHandler = require('./controller/errorController');
const BookingController = require('./controller/bookingController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/toursRoute');
const userRouter = require('./routes/usersRoute');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/veiwsRoute');
const bookingRouter = require('./routes/bookingRoute');

const app = express();

app.enable('trust proxy', 1);
app.set('view engine' , 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('views', path.join(__dirname,'views'));
// serving static files
app.use(express.static(`${__dirname}/public`));



//middlewre

//GLOPAL MIDDLEWARE

//set the cors 
// this will set the ( Access-Control-Allow-Origin ) to  *
// if the frontend and backend is not in the same domain or port or protocol : www.frontend.com // www.backend/api/v1 
//app.use(cors({origin: 'www.frontend.com}))
app.use(cors()); // this just allwo the simple request ('get , post')
app.options(/.*/, cors()) // * : all the routes , this will make the server response to the options that broser reqested for knew if post and delete and another methode is allowed or not 
// app.options('api/v1/tours/id', cors()) for applay it in one toure 
// set security http headers
//app.use(helmet());
app.post('/webhook-checkout', express.raw({ type: 'application/json'}), BookingController.webhooksCheckout)

// Body parser , reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

//Data sanitization against Nosql querey injection
app.use(expressMongoSanitize());
//app.use(mongoSanitize());
//Data sanitize against xss
app.use(xssSanitize());
//app.use(xss());
// prevent parameters pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
      'ratingAverage',
    ],
  }),
);
// for comprisse the text 
app.use(compression());
// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit request from same ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this ip, please try again in an hour!',
});
app.use('/api', limiter);
// app.use((req, res, next) => {
//     console.log('hellow from the middelware');
//     next();
// })
// TESTING MIDDLWARE
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
  //console.log('tessssst', req.headers)
  next();
});
// Router.param('id', (req, res, next,val)=>{
//      console.log('tour id is ' + val);
//      next();
//  })
// routes
//this is the first edit 
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
app.use('/', viewRouter);
app.all(/.*/, (req, res, next) => {
  const err = new AppError(
    404,
    `this page  ${req.originalUrl} not found on the server`,
  );
  next(err);
});
app.use(globalErrorHandler);
module.exports = app;

