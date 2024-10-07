import Notification from "../models/notification.model.js"

export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId

        await Notification.updateMany({to: userId}, {read: true})

        const notifications = await Notification.find({to: userId})
        .populate({
            path: "from",
            select: "username profileImg"
        })

        res.status(200).json({
            success: true,
            notifications: notifications
        })
    } catch (error) {
        console.log(`Error in getNotifications controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.userId

        await Notification.deleteMany({to: userId})

        res.status(200).json({
            success: true,
            message: "Notifications deleted successfully"
        })
    } catch (error) {
        console.log(`Error in deleteNotifications controller: ${error.message}`)
        res.status(400).json({ success: false, message: error.message })
    }
}