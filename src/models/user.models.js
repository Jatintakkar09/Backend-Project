import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url (we will import it from third party services)
      required: true,
    },
    CoverImager: {
      type: String, //cloudinary url (we will import it from third party services)
    },
    WatchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    Password: {
      type: String,
      required: true,
    },
    RefreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save",()=>{})  we dont give callback in hooks like this not a good practice

userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();
  this.Password = bcrypt.hash(this.Password, 10);
  next();
}); // time lagta hai thats why

// methods creation

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.Password);
};
// the above is a way in which the userdata that password is provided
//is similar to the password that is saved

// making methods to make access tokens and refresh tokens
userSchema.methods.generateAccessTokens = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: thus.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshTokens = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
