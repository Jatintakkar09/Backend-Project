import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true  
}))

app.use(express.json({
    limit: "16kb"
}))// to accept data as JSON a limit has been set for security purposes

app.use(express.urlencoded({
    extended: true, limit: '16kb'
}))

app.use(express.static("public"))
//to store files etc i.e public assets

app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'

import SampleRoute from './routes/sample.route.js'

// routes declaration

// app.get   yaha nahi krna kyuki router seprate hai middlewear lana padega
 app.use("/api/v1/users", userRouter)

 app.use("/api/v1/sample",SampleRoute)

export { app }




