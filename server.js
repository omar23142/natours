const mongoose = require('mongoose');
const dotenv = require('dotenv');

//ERROR HANDLER FOR UNCAUGHTEXCEPTION
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHTEXCEPTION SHUTING🤧 OFF THE SERVER');
  console.log('ERROR_NAME ',err.name, err.message);
  console.error(err);
  //console.error(err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
//   })
//   .then(() => console.log('DB connection successful!'));
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('connected to the databass sucessfuly ');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandlerdRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLERREJECTION 🤧 SHUTING DOWN THE SERVER');
  server.close(() => {
    process.exit(1);
  });
});

