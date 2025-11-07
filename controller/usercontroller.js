const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/usermodule');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handllerFactory');

const filterObj = (req, ...allowedfilds) => {
  const filteredreq = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedfilds.includes(el)) filteredreq[el] = req.body[el];
  });
  return filteredreq;
};

  // const multerStorag = multer.diskStorage({
  //   destination: (req, file, cb) =>{
  //   cb(null, 'public/img/users',)
  //   } ,
  //   filename: (req, file, cb) => {
  //     // console.log(file);
  //     // console.log('++++++++++++++++', req.file)
  //     const ext = file.mimetype.split('/')[1];
  //     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  //   }
  // });

const multerStorag = multer.memoryStorage();

  const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image'))
      cb(null, true);
    else
      cb(new AppError(400, 'not a photo pleas upload only photo file'), false);
  }
  const upload = multer( {
    storage: multerStorag,
    fileFilter: multerFilter } );
exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync (async (req, res, next) => {
  if(!req.file)
    return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({quality: 90})
      .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  // console.log(req.file)
  // console.log(req.body);
  // 1 create error if users try to post password
  if (req.body.password || req.body.passwordConf)
    return next(
  new AppError(
        400,
        "you can't change your password from here pleas use forgotePassword ",
      ),
    );
  // 2 update the user document
  const filteredBody = filterObj(req, 'email', 'name', 'photo');
  if(req.file)
    filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: 'true',
    runValidators: 'true',
  });
  
  // const user = await User.findById(req.user.id);
  // user.email = req.body.email;
  // user.name = req.body.name;
  // await user.save();
  
  res.status(200).json({
    status: 'success',
    message: 'your information is modified ',
    updatedUser,
  });
});
exports.getMe = (req, res, next) =>{
req.params.id = req.user.id ;
  next();
}
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.creatUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet define pleas use signup instead',
  });
};


exports.getallUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.udateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

