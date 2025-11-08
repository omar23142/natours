///////////////////////////////////////////////////////////////////////
const multer = require("multer");
const sharp = require("sharp");
const fs = require('fs');
const qs = require('qs');
const Tour = require('../models/tourmodule');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handllerFactory');



const multerStorag = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image'))
    cb(null, true);
  else
    cb(new AppError(400, 'not a photo pleas upload only photo file'), false);
}
const upload = multer( {
  storage: multerStorag,
  fileFilter: multerFilter } );
exports.uploadTourPhoto = upload.fields([{ name:'imageCover', maxCount:1 },
    { name:'images', maxCount:3 }]);

//upload.array('images',3);
//upload.single('imagCover');

exports.resizeTourPhotoes = catchAsync (async(req, res, next) => {
  //console.log(req.files);
  if(!req.files.imageCover || !req.files.images)
    return next();
  // 1 imagecover
  const imgCoverName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  req.body.imageCover = imgCoverName;
  await sharp(req.files.imageCover[0].buffer)
      .resize(2000,1333)
      .toFormat('jpeg')
      .jpeg({quality: 90 })
      .toFile(`public/img/tours/${imgCoverName}`);
// 2 images
  req.body.images = [];
  await Promise.all ( req.files.images.map(async (file, i) => {
    const fileName = `tour-${req.params.id}-${Date.now()}-tour${i + 1 }.jpeg`;
    await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
        req.body.images.push(fileName);
  }));
  next();
});


exports.aliasTopTour = (req, res, next) => {
  //console.log('hello from the alise middleware');
  req.usealias = true;
  req.aliasQuery = {
    ...req.query,
    sort: '-ratingsAverage,price',
    limit: '5',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  // console.log('after', req.aliasQuery);
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, 'reviews');
exports.createTour = factory.creatOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourwithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    return next(
      new AppError(
        400,
        'pleas provide the latitutr and longitude in the format lat,lng',
      ),
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  //console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    tours: tours,
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const miltiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    return next(
      new AppError(
        400,
        'pleas provide the latitutr and longitude in the format lat,lng',
      ),
    );
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: miltiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    results: distance.length,
    distance: distance,
  });
});

exports.getTourState = catchAsync(async (req, res, next) => {
  const states = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: 'ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      states: states,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStart: -1 } },
    { $limit: 12 },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan: plan,
      results: plan.length,
    },
  });
});
