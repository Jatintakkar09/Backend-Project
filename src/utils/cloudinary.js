import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (LocalFilePath) => {
  try {
    if (!LocalFilePath) return null;
    //uploading file on cloudinary
    const response = await cloudinary.uploader.upload(LocalFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded succesfully
    console.log(
      "File has been uploaded successfully on cloudinary",
      response.url
    );
    fs.unlinkSync(LocalFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(LocalFilePath);
    // the above will remove the locally saved temporary file as the upload opera
    // unlink means deletion of files
    return null
  }
};




export {uploadOnCloudinary}