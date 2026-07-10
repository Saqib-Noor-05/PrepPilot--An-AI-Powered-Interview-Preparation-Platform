const jwt = require('jsonwebtoken')
const blacklistModel = require('../models/token.blacklist.model')

async function authUser(req, res, next) {
    const token = req.cookies.token || req.headers.authoriation?.split(" ")[1]
    if (!token) {
        return res.status(400).json({
            message: "Invalid token"
        })
    }
    const istokenBlacklisted = await blacklistModel.findOne({ token })
    if (istokenBlacklisted) {
        return res.status(403).json({
            message: "Invalid token try again"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next()
    } catch (err) {
        res.status(400).json({
            message: "Access denied", err
        })
    }


}

module.exports = {
    authUser
}