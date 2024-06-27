import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
//  things needed for registering a user or checkpoints

// get user details from frontend
// validation - not empty
// check if user already exists -by email or username
// files uploaded or not i.e. avatar and cover image
// upload them to cloudinary, avatar checking
// create  user object - create entry in db
// remove the password and access token from response
//  check for user creation
// return response or error

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((feild) => {
      feild?.trim() === "";
    })
  ) {
    throw new ApiError(400, "all fields are required");
  }

  //check mark for checking the user exists or not
 const  existedUser= User.findOne(
    {
        $or: [{username},{email}]
    }
)
  


if (existedUser) {
    throw new ApiError("409","User Already Exists")
}
// for checking image file is present or not

const avatarLocalPath= req.files?.avatar[0]?.path

const coverImageLocalPath= req.files?.coverImage[0]?.path

if (!avatarLocalPath) {
  throw new ApiError("409","avatar image not found")
}


});

export { registerUser };
