const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'the review is required here '],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'the rating is required here '],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to tour'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  //   .populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  next();
});

reviewSchema.statics.calAveragerating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avrRating: { $avg: '$rating' },
      },
    },
  ]);

  const Tour = require('./tourmodule');
  //console.log(stats);
  if (stats.length <= 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingQuantity: 0,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avrRating,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calAveragerating(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function () {
  this.doc = await this.model.findOne(this.getQuery());
  //console.log(this.doc);
});
reviewSchema.post(/^findOneAnd/, async function () {
  const new1 = await this.doc.constructor.calAveragerating(this.doc.tour);
 // console.log(new1);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
