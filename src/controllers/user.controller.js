import { asyncHandler } from "../utils/asyncHandler.js";

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
 const {fullName,email,username,password}=req.body
 console.log("email:", email);
res.status(200).json({
    message:"ok"
})

});

export { registerUser };
