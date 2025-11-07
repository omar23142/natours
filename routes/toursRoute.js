const express = require('express');
const reviewRouter = require('./reviewRoute');
const authcontroller = require('../controller/authController');
const tourcontroller = require('../controller/tourcontroller');

const Router = express.Router();

//Router.param('id', tourcontroller.checkID);

Router.use('/:tourId/reviews', reviewRouter);

Router.route('/tourState').get(tourcontroller.getTourState);
Router.route('/distances/:latlng/unit/:unit').get(tourcontroller.getDistance);
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourcontroller.getTourwithin,
);

Router.route('/top-5-cheap').get(
  tourcontroller.aliasTopTour,
  tourcontroller.getAllTours,
);

Router.route('/')
  .get(tourcontroller.getAllTours)
  .post(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontroller.createTour,
  );

Router.route('/monthlyplan/:year').get(
  authcontroller.protect,
  authcontroller.restrictTo('admin', 'guide-lead', 'guide'),
  tourcontroller.getMonthlyPlan,
);

Router.route('/:id')
  .get(tourcontroller.getTour)
  .patch(authcontroller.protect,
      authcontroller.restrictTo('admin', 'guide-lead'),
      tourcontroller.uploadTourPhoto,
      tourcontroller.resizeTourPhotoes,
      tourcontroller.updateTour)
  .delete(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'guide-lead'),
    tourcontroller.deleteTour,
  );

module.exports = Router;
