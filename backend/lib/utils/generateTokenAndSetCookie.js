import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie = (userID, res) => {
    const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
        expiresIn: '15d'
    })
    res.cookie("userjwt", token, {
        httpOny: true,
        maxAge: 15 * 24 * 60 * 60 * 1000,
        sameSite: "Strict",
        secure: process.env.NODE_ENV !== "development"
    })
}