import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateJWTToken } from "../utils/generateJWTToken.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../resend/email.js";
import crypto from 'crypto'


//signup
export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //makes sure all the info is there
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //checks if email already exists in db (no dupes)
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        message: "Email is already connected to a user. Try Logging In!",
      });
    }

    //makes hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    //makes verification token
    const verificationToken = generateVerificationToken();
    //makes user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24hrs
    });

    await user.save();

    generateJWTToken(res, user._id);

    //sends verification email
    await sendVerificationEmail(user.email, verificationToken);


    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        ...user._doc,
        password: undefined, //so it doesnt just show the password
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//login
export const login = async (req, res) => {

  const {email, password} = req.body

  try {
    //finds the user
    const user = await User.findOne({ email });
    //if no user...
    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No user found",
        });
    }   
    //checks for correct passowrd
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({success: false, message: "Incorrect Password"})
    }

    //checks to make sure they verifiged their email address
    const isVerified = user.isVerified

    if (!isVerified) {
      return res.status(400).json({success: false, message: "Please verify your email"})

    }

    generateJWTToken(res, user._id)
    

    res.status(200).json({success: true, message:"Login Successful"})
  } catch (error) {
    console.log("Error logging in", error);
    return res.status(400).json({success: false, message: error.message})

  }
};

//logout
export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({success: true, message:"successfully logged out"})
};

//forgot-password
export const forgotPassword = async (req, res) => {
const {email} = req.body
try {
  const user = await User.findOne({email})
  if (!user) {
    return res.status(400).json({success: false, message:"No user found"})
  }
  const resetPasswordToken = crypto.randomBytes(32).toString("hex")
  const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 h

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpiresAt = resetPasswordExpiresAt;

  await user.save();
  await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`)

  res.status(200).json({success: true, message:"Password Reset Email Sent"})

} catch (error) {
  console.log("Error sending password reset email", error);
  
  return res.status(400).json({success: false, message: error.message})

}
};

//verify email address
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  
  try {
  //make sure the users in there
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification token",
        });
    }
    //changes values 
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    //sends welcoem email
    await sendWelcomeEmail(user.email, user.username);
    res
      .status(200)
      .json({ success: true, message: "email verified successfully" });
  } catch (error) {
    console.log("error verifying email");
    res.status(400).json({ success: false, message: error.message });
  }
};


//reset password
export const resetPassword = async (req, res) => {
  try {
    const {token} = req.params
    const {password } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: {$gt: Date.now()}
    })

    if (!user) {
      return res
      .status(400)
      .json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email)

  } catch (error) {
    console.log("error resetting password");
    res.status(400).json({ success: false, message: error.message });
  }
}


export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res
      .status(400)
      .json({
        success: false,
        message: "No user found",
      });
    }
    res.status(200).json({success: true, user: { ...user._doc, password: undefined}})
  } catch (error) {
    console.log("error authorizing user");
    res.status(400).json({ success: false, message: error.message });
  }
}