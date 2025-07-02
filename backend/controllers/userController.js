import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_token";
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({id:userId}, JWT_SECRET, {expiresIn: TOKEN_EXPIRES });

// REGISTER FUNCTION
export async function regiterUser(req, res) {
  const {name, email, password} = req.body;

  if(!name || !email || !password) {
    return res.status(400).json({success: false, massage: "All field are required"});
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({success: false, massage: "Invalid email"});
  }
  if (password.length < 8) {
      return res.status(400).json({success: false, massage: "Password must be atleast 8 characters"})
  }

  try{
    if (await User.findOne({email})) {
      return res.status(409).json({success: false, massage: "User already exists"});   
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({name, email, password: hashed});
    const token = createToken(user._id);

    res.status(201).json({success: true, token, user:{id:user._id, name:user.name, email: user.email} });
  }

  catch (err){
    console.log(err);
    res.status(500).json({success: false, massage: "Server Erorr"})
  }
}


// LOGIN FUNCTION
export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, massage: "All field are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, massage: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, massage: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.status(200).json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, massage: "Server Error" });
  }
}


// GET CURRENT USER
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select('name email');
    if (!user) {
      return res.status(404).json({ success: false, massage: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, massage: "Server Error" });
  }
}

// UPDATE USER PROFILE
export async function updateProfile(req, res) {
  const { name, email } = req.body;

  if (!name || !email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, massage: "Valid name and email required" });
  }

  try {
    const userId = (req.user.role === 'admin' && req.params.id) ? req.params.id : req.user.id;

    const exists = await User.findOne({
      email,
      _id: { $ne: userId }
    });

    if (exists) {
      return res.status(409).json({ success: false, massage: "Email already in use by another account." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true, select: "name email" }
    );

    if (!user) {
      return res.status(404).json({ success: false, massage: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, massage: "Server Error" });
  }
}

// CHANGE PASSWORD FUNCTION
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Old and new password required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
  }

  try {
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// ADMIN CHANGE USER PASSWORD
export async function adminUpdateUserPassword(req, res) {
  const { newPassword } = req.body;
  const { id } = req.params;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password is required and must be at least 8 characters."
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET ALL USERS (ADMIN)
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('name email role');
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

export async function updateUserProfileByAdmin(req, res) {
  const { name, email } = req.body;

  if (!name || !email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid name and email required" });
  }

  try {
    const userId = req.params.id;

    const exists = await User.findOne({
      email,
      _id: { $ne: userId }
    });

    if (exists) {
      return res.status(409).json({ success: false, message: "Email already in use by another account." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true, select: "name email role" }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
