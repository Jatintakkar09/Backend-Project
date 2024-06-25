import { asyncHandler } from "../utils/asyncHandler.js";


export const SampleResponse = asyncHandler(async (req,res)=>{
    res.status(201).json({
        message: "baccha seekh raha hai"
    })
})  

