const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: `./config.env` });
const Tour = require(`./../../models/tourmodule`);
const User = require('../../models/usermodule');
const Review = require('../../models/reviewmodule');

console.log(`this is the test : ${process.env.DATABASE_LOCAL}`);

//console.log(app.get('env'));
//const DB = process.env.DATABASS.replace('<PASSWORD>',process.env.PASSWORD);

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    //useCreateIndex:true,
    //useFindAndModify:false
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('connected to the databass sucessfuly ');
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));//console.log(tours);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);
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
