import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { generateTokenAndSetCookie } from '../lib/utils/generateTokenAndSetCookie.js';

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: 'Invalid email format' });
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username is already taken' });
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email is already taken' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const newUser = new User({ fullName, username, email, password: hashedPassword });
    generateTokenAndSetCookie(res, newUser._id);
    await newUser.save();
    res.status(201).json({
      success: true,
      message: 'Signup successfully',
      user: {
        ...newUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(`Error in Signup Controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcryptjs.compare(password, user?.password || '');
    if (!user || !isPasswordCorrect)
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    generateTokenAndSetCookie(res, user._id);
    res.status(200).json({
      success: true,
      message: 'Login successfully',
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(`Error in Login Controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout successfully' });
  } catch (error) {
    console.log(`Error in Logout Controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.log(`Error in checkAuth Controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};
