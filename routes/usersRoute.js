const express = require('express');
const usercontroller = require('../controller/usercontroller');


const Router = express.Router();
const authcontroller = require('../controller/authController');



Router.post('/signup', authcontroller.signup);
Router.post('/sigin', authcontroller.sigin);
Router.get('/logout', authcontroller.logOut);
Router.post('/forgotePassword', authcontroller.forgetPass);
Router.post('/resetPassword/:token', authcontroller.resetPass);

Router.use(authcontroller.protect);
Router.patch('/updateMypssword', authcontroller.updatePassword);
Router.patch('/updateMe',usercontroller.uploadPhoto,usercontroller.resizeUserPhoto, usercontroller.updateCurrentUser);
Router.delete('/deleteMe', usercontroller.deleteMe);
Router.get('/me', usercontroller.getMe, usercontroller.getUser);


Router.use(authcontroller.restrictTo('admin'));

Router.route('/')
  .get(usercontroller.getallUsers)
  .post(usercontroller.creatUser);
Router.route('/:id')
  .get(usercontroller.getUser)
  .patch(usercontroller.udateUser)
  .delete(usercontroller.deleteUser);

module.exports = Router;
