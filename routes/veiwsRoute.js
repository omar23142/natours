const express = require('express');
const viewController = require('./../controller/viewsController');
const router = express.Router();
const authController = require('./../controller/authController');
const bookingController = require('../controller/bookingController')


router.get('/', bookingController.createBookingAfterCheckout ,authController.isLogedin, viewController.getOverview);
router.get('/tour/:slug',authController.isLogedin, viewController.getTour); 
router.get('/login' ,authController.isLogedin, viewController.getLoginForm);
router.get('/me',authController.protect, viewController.getAcountPage);
router.get('/my-booking', authController.protect, viewController.getUserBooking)
//router.post('/submit-user-data',authController.protect, viewController.updateUserData)
module.exports = router;