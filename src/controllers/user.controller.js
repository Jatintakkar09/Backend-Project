import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Things needed for registering a user or checkpoints

// get user details from frontend
// validation - not empty
// check if user already exists - by email or username
// files uploaded or not i.e. avatar and cover image
// upload them to cloudinary, avatar checking
// create user object - create entry in db
// remove the password and access token from response
// check for user creation
// return response or error

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Validation - not empty
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists - by email or username
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // For checking image file is present or not
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar image not found");
  }

  // Upload them to cloudinary, avatar checking
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar) {
    throw new ApiError(409, "Avatar image upload failed");
  }

  // Create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Check for user creation
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // Remove the password and access token from response
  // Return response or error
  return res.status(201).json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

export { registerUser };
