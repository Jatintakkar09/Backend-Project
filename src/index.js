import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { DB_Name } from "./constants.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log(`Ther error is ${error}`);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is listening at port :
             ${process.env.PORT}`);
    })
    })
.catch((error)=>{
    console.log("Mongo DB Connection error",error);
})