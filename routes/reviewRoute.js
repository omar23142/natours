const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setUserTourIds,
    reviewController.createReview,
  )
  .get(reviewController.getallReview);

router
  .route('/:id')
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deletReview,
  )
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview,
  )
  .get(reviewController.getReview);
module.exports = router;
