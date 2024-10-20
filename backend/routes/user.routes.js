import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { folowUnfolowUser, getSuggestedUser, getUserProfile, updateUser } from "../controllers/user.controller.js"
const router = express.Router()
router.get("/profile/:username", getUserProfile)
router.get("/suggested", protectRoute, getSuggestedUser)
router.post("/folow/:id", protectRoute, folowUnfolowUser)
router.post("/update", protectRoute, updateUser)


export default router