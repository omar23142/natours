const express = require('express');
const authController = require('../controller/authController')
const bookingController = require('./../controller/bookingController');
const router = express.Router();

router.use(authController.protect);
router.get('/checkout-session/:tourId',authController.protect, bookingController.getstripecheckoutSession);

router.use(authController.restrictTo('admin','lead-guide'))

router.route('/')
    .get(bookingController.getAllBooking)
    .post(bookingController.createBooking);

router.route('/:id')
    .get(bookingController.getBooking)
    .delete(bookingController.deleteBooking)
    .patch(bookingController.updateBooking);

module.exports = router;