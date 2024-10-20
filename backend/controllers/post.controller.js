export const createPost = async (req, res) => {
    try {
        const { text } = req.body
        let { img } = req.body
        const userId = req.user._id.toString()

    } catch (error) {
        console.log('Error from signup controller !!!', error.message)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}