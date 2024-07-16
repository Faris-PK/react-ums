import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// Static admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// @desc   Auth admin/set token
// route   POST /api/admin/auth
// @access Public
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const admin = { email: ADMIN_EMAIL, name: 'Admin' };
    generateToken(res, admin.email);
    res.status(200).json(admin);
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc   Logout admin
// route   POST /api/admin/logout
// @access Public
const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Admin logged out' });
});

// @desc   Add new user
// route   POST /api/admin/users
// @access Private (Admin)
const addUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc   Edit user
// route   PUT /api/admin/users/:id
// @access Private (Admin)
const editUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc   Delete user
// route   DELETE /api/admin/users/:id
// @access Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.status(200).json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc   Get admin data
// route   GET /api/admin/data
// @access Private (Admin)
const getAdminData = asyncHandler(async (req, res) => {
  const admin = { email: ADMIN_EMAIL, name: 'Admin' };
  res.status(200).json(admin);
});

export {
  authAdmin,
  logoutAdmin,
  addUser,
  editUser,
  deleteUser,
  getAdminData,
};
