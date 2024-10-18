import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.userjwt
        if (!token) {
            return res.status(400).json({
                errMessage: "Unauthorized: No Token Provided"
            })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        if (!decode) {
            return res.status(400).json({
                errMessage: "Unauthorized: Invalid Token !!!"
            })
        }
        const user = await User.findById(decode.userID).select("-password")
        if (!user) {
            return res.status(400).json({
                errMessage: "User not founded"
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log("Error from protectRoute in middleware", error.message)
        return res.status(500).json({
            errMessage: "Intenal server error !!!"
        })
    }
}