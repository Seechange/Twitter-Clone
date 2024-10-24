import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import cloudinary from "cloudinary"

export const createPost = async (req, res) => {
    try {
        const { text } = req.body
        let { img } = req.body
        const userId = req.user._id.toString()
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                errMessage: "User not found !!!"
            })
        }

        if (!text && !img) {
            return res.status(400).json({
                errMessage: "Post must have text or image"
            })
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }
        const newPost = new Post({
            userId,
            text,
            img
        })
        await newPost.save()
        return res.status(200).json({
            newPost
        })
    } catch (error) {
        console.log('Error from createPost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const deletePost = async (req, res) => {
    try {
        const idPost = req.params.id
        const post = await Post.findById(idPost)
        if (!post) {
            return res.status(400).json({
                errMessage: "Post not found !!!"
            })
        }
        console.log('check1 :', post.userId.toString())
        console.log('check2 :', req.user._id.toString())
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                errMessage: "You are not authorized to delete this post"
            })
        }
        if (post.img) {
            const idImg = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(idImg)
        }
        await Post.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            errMessage: "Post deleted successfull"
        })
    } catch (error) {
        console.log('Error from deletePost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const idPost = req.params.id
        const idCommentPost = req.user._id
        const { text } = req.body
        if (!text) {
            return res.status(400).json({
                errMessage: "Text field is required"
            })
        }
        const post = await Post.findById(idPost)
        if (!post) {
            return res.status(400).json({
                errMessage: "Post not found !!!"
            })
        }
        const commnet = { text, userId: idCommentPost }
        post.comments.push(commnet)
        await post.save()
        return res.status(200).json({
            errMessage: "Comment post successfull"
        })


    } catch (error) {
        console.log('Error from commentPost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const idPost = req.params.id
        const userId = req.user._id
        const post = await Post.findById(idPost)
        if (!post) {
            return res.status(400).json({
                errMessage: "Post not found !!!"
            })
        }
        const userLikePost = post.likes.includes(userId)
        if (userLikePost) {
            await Post.updateOne({ _id: idPost }, { $pull: { likes: userId } })
            await User.updateOne({ _id: userId }, { $pull: { likedPost: idPost } })
            return res.status(400).json({
                errMessage: "User unliked post successfull !!!!"
            })
        } else {
            post.likes.push(userId)
            await User.updateOne({ _id: userId }, { $push: { likedPost: idPost } })
            await post.save()
            const notification = new Notification({
                from: userId,
                to: post.userId,
                type: "like"
            })
            await notification.save()
            return res.status(200).json({
                errMessage: "User liked post successfull !!!"
            })
        }
    } catch (error) {
        console.log('Error from likeUnlikePost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getAllPost = async (req, res) => {
    try {
        const allPost = await Post.find().sort({ createAt: -1 }).populate({
            path: "userId",
            select: "-password"
        }).populate({
            path: "comments.userId",
            select: "-password"
        })
        if (allPost.length === 0) {
            return res.status(200).json([])
        }
        return res.status(200).json(allPost)
    } catch (error) {
        console.log('Error from getAllPost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getAllLikedPost = async (req, res) => {
    const userId = req.params.id
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                errMessage: "User not found !!"
            })
        }
        const likedPost = await Post.find({ _id: { $in: user.likedPost } }).populate({
            path: "userId",
            select: "-password"
        }).populate({
            path: "comments.userId",
            select: "-password"
        })
        return res.status(200).json({
            likedPost
        })
    } catch (error) {
        console.log('Error from getAllLikedPost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getFollowingPost = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                errMessage: "User not found !!!"
            })
        }
        const followingPost = await Post.find({ userId: { $in: user.following } }).sort({
            createAt: -1
        }).populate({
            path: "userId",
            select: "-password"
        }).populate({
            path: "comments.userId",
            select: "-password"
        })

        return res.status(200).json(followingPost)
    } catch (error) {
        console.log('Error from getFollowingPost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getUserPost = async (req, res) => {
    try {
        const userName = req.params.username
        const user = await User.findOne({ userName: userName })
        if (!user) {
            return res.status(400).json({
                errMessage: "User not found !!!"
            })
        }
        const userPostId = user._id
        const userPost = await Post.find({ userId: userPostId }).sort({ createAt: -1 }).populate({
            path: "userId",
            select: "-password"
        }).populate({
            path: "comments.userId",
            select: "-password"
        })
        return res.status(200).json({
            userPost
        })
    } catch (error) {
        console.log('Error from getUserPost controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

