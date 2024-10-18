import express from "express"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import dotenv from "dotenv"
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"
dotenv.config()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const PORT = process.env.PORT || 5000

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

app.listen(PORT, () => {
    console.log("Server is running on port ", PORT)
    connectMongoDB()
})