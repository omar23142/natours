const express = require('express');
const viewController = require('./../controller/viewsController');
const router = express.Router();
const authController = require('./../controller/authController');
//const bookingController = require('../controller/bookingController')

router.use(viewController.setLocalsAlert)
router.get('/', authController.isLogedin, viewController.getOverview);
router.get('/tour/:slug',authController.isLogedin, viewController.getTour); 
router.get('/login' ,authController.isLogedin, viewController.getLoginForm);
router.get('/me',authController.protect, viewController.getAcountPage);
router.get('/my-booking', //bookingController.createBookingAfterCheckout ,
 authController.protect, viewController.getUserBooking)
router.post('/submit-user-data',authController.protect, viewController.updateUserData)
module.exports = router;