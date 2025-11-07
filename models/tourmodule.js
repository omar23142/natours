const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const { type } = require('mquery/lib/env');
const User = require('./usermodule');
const Review = require('./reviewmodule');

//console.log('registered models:', mongoose.modelNames());
const TourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'this tour must have a name'],
      unique: true,
      maxlength: [
        40,
        'this tour name must be equlas or less than 40 characters',
      ],
      minlength: [
        10,
        'this tour name must be equals or more than 10 characters',
      ],
      //validate: validator.isAlpha
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'this tour must have a durations'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'the difficulty must be easy or medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'ratingsaverage must be above or equals 1.0'],
      max: [5.0, 'ratingsaverage must be less or equlas 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'this tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this is only points ot current doc on new document creation
          return this.price > val;
        },
        message: 'discount price({VALUE}) must be lower than the orginal price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'the tour must have a description '],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'the tour must have a imagecover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: {type:[Date],
    default:Date.now() },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        description:String
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);
TourSchema.index({ price: 1, ratingsAverage: -1 });
TourSchema.index({ slug: 1 });
TourSchema.index({ startLocation: '2dsphere' });
TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// this midleware is work when we use .creat() and .save() but don't work when we use updateMany()
TourSchema.pre('save', function (next) {
  //console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});
// TourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// TourSchema.post('save', function(doc,next){
//     console.log('this is doc ', doc);
//     next();
// })

TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: false });
  this.start = Date.now();
  next();
});
TourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v' });
  next();
});
TourSchema.post(/^find/, function (docs, next) {
  console.log('this query took ', Date.now() - this.start, 'millie seconds');
  //console.log(docs);
  next();
});
// TourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //console.log(this.pipeline());
//
//   next();
// });
const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;

// const TestTour = new Tour(
//     {name:'the forest hicker',
//      rating:4.7,
//      price:497
// });
// const TestTour2 = new Tour(
//     {name:'the forest hicker3',

// });
// TestTour.save().then(doc =>{
//     console.log(doc);
// }).catch(err =>{
//     console.log('ERROR',err);
// });
