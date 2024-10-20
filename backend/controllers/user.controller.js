import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "cloudinary"
export const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const profileUser = await User.findOne({ userName: username }).select("-password")
        if (!profileUser) {
            return res.status(400).json({
                errMessage: "User not found"
            })
        }

        return res.status(200).json(profileUser)
    } catch (error) {
        console.log('Error from getUserProfile', error.message)
        return res.status(500).json({
            errMessage: error.message
        })
    }
}

export const folowUnfolowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)
        if (id === req.user._id.toString()) {
            return res.status(400).json({
                errMessage: "You can not folow/unfolow yourself"
            })
        }

        if (!userToModify || !currentUser) {
            return res.status.json({
                errMessage: "User not found"
            })
        }
        const isFollowing = currentUser.following.includes(id)
        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            return res.status(200).json({
                errMessage: "User unfolowed successfull"
            })
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            //send notification to user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id
            })
            await newNotification.save()
            return res.status(200).json({
                errMessage: "User folowed successfull"
            })
        }

    } catch (error) {
        console.log('Error from folowUnflolowUser', error.message)
        return res.status(500).json({
            errMessage: error.message
        })
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id
        const userFollowedByMe = await User.findById(userId).select("following")
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            { $sample: { size: 10 } }
        ])
        const fillteredUsers = users.filter(user => !userFollowedByMe.following.includes(user._id))
        const suggestedUser = fillteredUsers.slice(0, 4)
        suggestedUser.forEach((user) => (user.password = null))
        res.status(200).json(suggestedUser)
    } catch (error) {
        console.log('Error from getSugggestUser', error.message)
        return res.status(500).json({
            errMessage: error.message
        })
    }
}

export const updateUser = async (req, res) => {
    const { fullName, userName, email, currentPassword, newPassword, bio, link } = req.body
    let { profileImg, coverImg } = req.body
    const userId = req.user._id
    try {
        let user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                errMessage: "User not found"
            })
        }
        if ((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
            return res.status(400).json({
                errMessage: "Please provide both current Password and new Password"
            })
        }
        if (currentPassword && newPassword) {
            const isCheckPassword = await bcrypt.compare(currentPassword, user.password)
            if (!isCheckPassword) {
                return res.status(400).json({
                    errMessage: "Current Password is incorrect"
                })
            }
            if (newPassword.length < 6) {
                return res.status(400).json({
                    errMessage: "Password must be at least 6 charactors long"
                })
            }
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            profileImg = uploadedResponse.secure_url
        }
        user.fullName = fullName || user.fullName
        user.userName = userName || user.userName
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()
        user.password = null
        return res.status(200).json({
            errMessage: "Update User success !!!",
            data: user
        })
    } catch (error) {
        console.log('Error from getSugggestUser', error.message)
        return res.status(500).json({
            errMessage: error.message
        })
    }
}