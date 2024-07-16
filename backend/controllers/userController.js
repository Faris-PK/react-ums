import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import cloudinary from '../utils/cloudinary.js';

// @desc   Auth user/set token
// route   POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body;

  const user = await User.findOne({email});
  if (user && (await user.matchPassword (password))) {
  generateToken(res, user._id, 'userJwt');
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage
  });
} else {
  res.status(401);
  throw new Error('Invalid email or password');
}
});




// @desc  Register a new user
// route  POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
  
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
  
    const user = await User.create({
      name,
      email,
      password,
    });
  
    if (user) {
      generateToken(res, user._id, 'userJwt');
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
});




// @desc  Auth user/set token
// route  POST /api/users/auth
// @access Public
const logoutUser = asyncHandler(async (req, res) => {

    res.cookie('userJwt','', {
        httpOnly:true,
        expires: new Date(0)

    })
  res.status(200).json({ message: 'User logged out' });
});





// @desc  Get user profile
// route  POST /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    profileImage: req.user.profileImage
  }
  res.status(200).json( user);
});





// @desc  Update user profile
// route  PUT /api/users/auth
// @access Public
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    
    if(user.profileImage) {
      const publicIdMatch = user.profileImage.match(/\/([^/]+)$/);
      if( publicIdMatch && publicIdMatch[1]) {
        const publicId = publicIdMatch[1]
        await cloudinary.uploader.destroy(publicId)
      }
    }

    if(req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        user.profileImage = result.secure_url;
      } catch (error) {
        return res.status(400).json({ error: 'Failed to upload image to Cloudinary' });
      }
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if(req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id:updatedUser._id,
      name:updatedUser.name,
      email:updatedUser.email,
      profileImage:updatedUser.profileImage
    })
  } else {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({message:'user profile updated'})
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
