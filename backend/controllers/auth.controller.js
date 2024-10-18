import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
    try {
        const { fullName, userName, password, email } = req.body
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                errMessage: "Invalid email format"
            })
        }
        const existingUser = await User.findOne({ userName })
        if (existingUser) {
            return res.status(400).json({
                errMessage: "UserName is already taken !!!"
            })
        }

        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({
                errMessage: "Email is already taken !!!"
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                errMessage: "Password must be at least 6 charactor"
            })
        }
        //mã hóa pass trc khi post lên database, dùng bcrypt
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // khởi tạo user
        const newUser = new User({
            fullName,
            userName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()

            return res.status(200).json({
                success: true,
                errMessage: "Account registration successfull !!!",
                data: {
                    id: newUser._id,
                    userName: newUser.userName,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    followers: newUser.followers,
                    following: newUser.following,
                    profileImg: newUser.profileImg,
                    coverImg: newUser.coverImg,
                    bio: newUser.bio,
                    link: newUser.link,
                }
            })
        } else {
            return res.status(400).json({
                errMessage: "Invalid user data"
            })
        }
    } catch (error) {
        console.log('Error from signup controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })

    }
}

export const login = async (req, res) => {
    try {
        const { userName, password } = req.body
        const user = await User.findOne({ userName })
        const isCheckPass = await bcrypt.compare(password, user?.password || " ")
        if (!user || !isCheckPass) {
            return res.status(400).json({
                errMessage: "Invalid username or password !!!"
            })
        }
        generateTokenAndSetCookie(user._id, res)
        return res.status(200).json({
            success: true,
            errMessage: "Login successfull !!!!",
            data: {
                id: user._id,
                userName: user.userName,
                fullName: user.fullName,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link,
            }

        })
    } catch (error) {
        console.log('Error from login controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("userjwt", "", { maxAge: 0 })
        return res.status(200).json({
            errMessage: "Logout successfull !!!"
        })
    } catch (error) {
        console.log('Error from login controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        return res.status(200).json({
            data: user
        })
    } catch (error) {
        console.log('Error from getme', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}