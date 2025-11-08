// import fs from 'fs';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// import Tour from '../../models/tourmodule.js'
// import User from '../../models/usermodule.js';
// import Review from '../../models/reviewmodule.js';
// import Booking from '../../models/bookingmodel.js';

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require(`./../../models/tourmodule`);
const User = require('../../models/usermodule');
const Review = require('../../models/reviewmodule');
const Booking = require('../../models/bookingmodel');


dotenv.config({ path: `./config.env` });

console.log(`this is the test : ${process.env.DATABASE_LOCAL}`);

//console.log(app.get('env'));
//const DB = process.env.DATABASS.replace('<PASSWORD>',process.env.PASSWORD);

// mongoose
//   .connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     //useCreateIndex:true,
//     //useFindAndModify:false
//   })
//   .then((con) => {
//     //console.log(con.connections);
//     console.log('connected to the local databass sucessfuly ');
//   });

//   const  write_bookings_file=  async()=> {
//   const bookings = await Booking.find();
//   console.log(bookings);

//   const file = fs.writeFileSync('./booking.txt',JSON.stringify(bookings,null, 2));
  
// };

// write_bookings_file();

//const DB = 'mongodb+srv://almgoshomar10_db_user:HESVADyHnsKgL2qr@cluster0.rpf4zjy.mongodb.net/?appName=Cluster0'
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DB_PASSWORD,
);
console.log('this is DB: ',DB);

mongoose
  .connect(DB, {
    //useNewUrlParser: true,
    //useCreateIndex: true,
    //useFindAndModify: false
  })
  .then(() => console.log('remote DB connection successful!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));//console.log(tours);
const bookings =JSON.parse(fs.readFileSync(`${__dirname}/booking.txt`, 'utf-8'));
console.log(bookings);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);
    await Booking.create(bookings);
    console.log('data successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

async function deletData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('delete data successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
}

async function delet_user_Data() {
  try {
    await User.deleteMany();
    console.log('delete data successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
}

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') deletData();
else if (process.argv[2] === '--delete_users') delet_user_Data();
