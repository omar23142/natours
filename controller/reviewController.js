const Review = require('../models/reviewmodule');
//const catchAsync = require('../utils/catchAsync');
const factory = require('./handllerFactory');

exports.setUserTourIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
}
exports.createReview = factory.creatOne(Review);
exports.getallReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deletReview = factory.deleteOne(Review);
