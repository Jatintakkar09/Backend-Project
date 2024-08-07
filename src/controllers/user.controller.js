import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//genearting refreshToken and accessToken

const generateAccessTokensandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessTokens();
    const refreshToken = user.generateRefreshTokens();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // to save new data in the database

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong");
  }
};

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
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
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

  console.log(req.files.avatar);

  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar image not found");
  }

  // Upload them to cloudinary, avatar checking
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

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
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // Remove the password and access token from response
  // Return response or error
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

// login user

// req body -> data
// username or email
// find the user
//password check
//access and refresh token
//Send cookies

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email, username, password);
  if (!(email || username)) {
    throw new ApiError(409, "Username or password required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(user);

  if (!user) {
    throw new ApiError(409, "user not registered");
  }

  // checking the password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Password is incorrect");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokensandRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // basically updated version needed to send to the user

  const options = {
    httpOnly: true,
    secure: true,
  };
  // the above are options to save cookies

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

// logging out a user

// basically to logout a user you need to clear cookies and remove refreshToken from backend

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  // the below method is clear the cookies that we had send to the user
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user Logged Out "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized Request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessTokensandRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("refreshToken", newrefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "accessToken Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, NewPassword} = req.body;

  

  const user = await User.findById(req.user?._id);

  const checkPassword = await user.isPasswordCorrect(oldPassword);

  if (!checkPassword) {
    throw new ApiError(409, "Password is wrong");
  }

  user.password = NewPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(202, {}, "Password Changed Successfully"));
});


const currentUser=asyncHandler(async(req,res)=>{
const user=req.user

return res.status(200).json(new ApiResponse(201,user,"User fetched successfully"))




})


export { registerUser, loginUser, logoutUser, refreshAccessToken ,changeCurrentPassword,currentUser };
