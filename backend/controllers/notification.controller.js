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

// export const deleteNotificationById = async(req, res) => {
//     try {
//         const idNoti = req.params.id
//         const userId = req.user._id
//         const noti = await Notification.findById(idNoti)
//         if(!noti){
//             return res.status(400).json({
//                 errMessage: "Notification not found !!!"
//             })
//         }
//         if(noti.to.toString() !== userId.toString()){
//             return res.status(400).json({
//                 errMessage: "User not authorizen delete notification !!!"
//             })
//         }
//         await Notification.findByIdAndDelete({_id: idNoti})
//         return res.status(200).json({
//             errMessage: "Deleted Notification successfull !!!"
//         })
        
//     } catch (error) {
//         console.log('Error from deleteNotificationById controller !!!', error.message)
//         return res.status(500).json({
//             error: "Internal Server Error"
//         })
//     }
// }