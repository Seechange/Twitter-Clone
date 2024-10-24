import Notification from "../models/notification.model.js"

export const getNotification = async (req, res) => {
    try {
        const userId = req.user._id
        const notification = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "userName profileImg"
        })
        await Notification.updateMany({ to: userId }, { read: true })
        res.status(200).json(notification)
    } catch (error) {
        console.log('Error from getNotification controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id
        await Notification.deleteMany({ to: userId })

        return res.status(200).json({
            errMessage: "Notificaiton deleted successfull !!!"
        })
    } catch (error) {
        console.log('Error from deleteNotification controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}