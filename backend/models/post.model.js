import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    text: {
        type: String
    },
    img: {
        type: String
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [{
        text: {
            type: String,
            require: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        }
    }]
}, { timestamps: true })

const Post = mongoose.model("Post", postSchema)
export default Post