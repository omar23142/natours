
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourmodule');
const Booking = require('../models/bookingmodel');
const User = require('../models/usermodule');
const factory = require('./handllerFactory');

exports.getstripecheckoutSession = catchAsync( async (req, res, next) => {
    // 1) get the curentlly booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'] ,
        mode: 'payment',
         //success_url:`${req.protocol}://${req.get('host')}/my-booking/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        success_url:`${req.protocol}://${req.get('host')}/my-booking`,
        cancel_url:`${req.protocol}://${req.get('host')}/${tour.slug}`  ,
        customer_email:req.user.email,
        client_reference_id:tour.id,
        line_items:[{
            price_data:{
                product_data:{
                    name:tour.name,
                    images:[`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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

// exports.createBookingAfterCheckout =catchAsync( async (req, res, next) => {
//     const {tour, user, price} = req.query;
//     if(!tour && !user && !price)
//         return next();
//     const booking = await Booking.create({tour, user, price});

//     res.redirect(req.originalUrl.split('?')[0]);
    
// });
const creatNewBooking = async (session) => {
    console.log('customer_email llllllll : ', session.customer_details.email)
    console.log('customer_email llllllll : ', session.customer_email)
    console.log('in the creatNewBooking' , session);
    const tour = session.client_reference_id;
    console.log('tour', tour)
    const user = await User.findOne({ email: session.customer_details.email });
    console.log('user ' , user);
    console.log('amount_total llllllll : ', session.amount_total)
    const price = session.amount_total/100;
    console.log('price ' , price)
    const booking = await Booking.create({tour, user, price});
    console.log('booking: ', booking);
    
}

exports.webhooksCheckout = (req, res, next) =>{
    let event;
    try {
        console.log('in the webhookscheckout')
    const signature = req.headers['stripe-signature'];
    console.log('sing', signature);
    event = stripe.webhooks.constructEvent( req.body, signature, process.env.STRIPE_WEbHOOK_SECRET );
}   catch(err) {
    console.error(err);
    return res.status(400).send(`webhook error ${err.message}`)
}
if (event.type === 'checkout.session.completed')
    creatNewBooking(event.data.object);
}

exports.createBooking = factory.creatOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);

