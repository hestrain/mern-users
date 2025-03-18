import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateJWTToken } from "../utils/generateJWTToken.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //checks if email
    const exist = await User.findOne({ email });
    if (exist) {
      return res
        .status(400)
        .json({
          message: "Email is already connected to a user. Try Logging In!",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24hrs
    });

    await user.save();

    generateJWTToken(res, user._id);

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const login = (req, res) => {
  res.send("Login Route");
};
export const logout = (req, res) => {
  res.send("Logout Route");
};
