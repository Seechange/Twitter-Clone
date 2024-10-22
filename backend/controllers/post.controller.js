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

