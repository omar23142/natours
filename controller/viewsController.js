const Tour = require('../models/tourmodule');
const User = require('../models/usermodule');
const Booking = require('../models/bookingmodel')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


exports.getOverview = catchAsync( async (req, res)=> {
    const tours = await Tour.find();
   
    //console.log('hellow from getOver',user)
    
    res.status(200).render('overview', {
    title:'All Tours',
    tours: tours,
    
  });
});

exports.getTour =catchAsync(async  (req, res, next)=> {
    const tour = await Tour.findOne({ slug:req.params.slug }).populate({path:'reviews',
        fields:'review, rating, user'
    });
    if (!tour) {
        return next(new AppError(404,'there is no tour with that name'));
    }
    //tour.reviews.forEach(el => { console.log(el.user)});
    res.status(200).render('tour', { 
        //layout: false,
        title: tour.name,
        tour 
})
});

exports.getLoginForm = (req, res) => {

    res.status(200).render('login', {
        title:'Log into your account'
    });
}

exports.getAcountPage = async (req, res) => {
     //const user = await User.findById(req.user.id);
    // console.log(user);
    //console.log('this is user',user);
    //let user= undefined;
    res.status(200).render('account', {
        title:'ACCOUNT DETAILES',
        
    });
};

// exports.updateUserData = catchAsync( async (req, res, next) => {
//     // must active the middlware use.(express.urlencoded()) for put the submited information on the req.body
//     console.log('this is tesssssssssssssssssst',req.body);
//     const user = await User.findByIdAndUpdate(req.user.id, {name:req.body.name, email:req.body.email},{new:true, runValidators:true})
//     res.status(200).render('account', {
//         title:'ACCOUNT DETAILES',
//         user
//         });
//     });

exports.getUserBooking = catchAsync( async (req, res, next) => {
    // 1) find all booking
     const bookings = await Booking.find({user: req.user.id})
    // // 2) find tours with the returned ids
     const tourIDs = bookings.map(el => el.tour);
     const tours = await Tour.find({ _id: {$in: tourIDs} });

    res.status(200).render('overview', {
        title:'MY BOOKING',
        tours
    })
})