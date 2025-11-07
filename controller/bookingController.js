const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourmodule');
const Booking = require('../models/bookingmodel');
const factory = require('./handllerFactory')
exports.getstripecheckoutSession = catchAsync( async (req, res, next) => {
    // 1) get the curentlly booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'] ,
        mode: 'payment',
        success_url:`${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url:`${req.protocol}://${req.get('host')}/${tour.slug}`  ,
        customer_email:req.user.email,
        client_reference_id:tour.id,
        line_items:[{
            price_data:{
                product_data:{
                    name:tour.name,
                    images:[`https://natours.dev/img/tours/${tour.imageCover}`],
                    description:tour.summary},
                currency:'usd',
                unit_amount:tour.price * 100,

            },
            quantity: 1
        }]
    })
    // 3) SEND RESPONSE WITH SESSION
    res.status(200).json({
        status:'success',
        session}
    )
});

exports.createBookingAfterCheckout =catchAsync( async (req, res, next) => {
    const {tour, user, price} = req.query;
    if(!tour && !user && !price)
        return next();
    const booking = await Booking.create({tour, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
    
});

exports.createBooking = factory.creatOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);

