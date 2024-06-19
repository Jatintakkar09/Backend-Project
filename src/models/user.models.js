import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
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
    email: {
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
        type: String
    }
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save",()=>{})  we dont give callback in hooks like this not a good practice

userSchema.pre("save", async function (next) {
    if (this.isModified("Password")) {
        
    }
    this.Password = bcrypt.hash(this.Password,10)  
    next()
}) // time lagta hai thats why

export const User = mongoose.model("User", userSchema);
