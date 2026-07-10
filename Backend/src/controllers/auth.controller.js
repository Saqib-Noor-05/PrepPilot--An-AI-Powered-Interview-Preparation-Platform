const express = require('express')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const blacklistModel = require('../models/token.blacklist.model')

/**
 * @name registerUserController
 * @description register a new user, expects username, email, and password in the request body
 * @access public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide all required fields"
        })
    }

    const isAlreadyExist = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (isAlreadyExist) {
        return res.status(400).json({
            message: "User Already Exist with the credentials, try using different inputs"
        })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        username,
        email,
        password: hash
    })
    const token = jwt.sign({
        _id: user._id,
        username: username
    }, process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("token", token)
    res.status(201).json({
        message: "User Registered Successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })

}


/**
 * @route POST /api/auth/login
 * @description login the user and return a token
 * @access public
 */
async function userLoginController(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide all required fields"
        })
    }
    const user = await userModel.findOne({
        email: email
    })
    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const isValidpassword = await bcrypt.compare(password, user.password)
    if (!isValidpassword) {
        res.status(400).json({
            message: "Invalid Password"
        })
    }
    const token = await jwt.sign({
        _id: user._id
    }, process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User LoggedIn Successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,

        }
    })


}


/**
 * @route POST /api/auth/logout
 * @description logout the user and blacklist the token
 * @access public 
 */
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(200).json({
            message: "User logout Successfully from ! token section"
        })
    }
    await blacklistModel.create({
        token: token
    })

    res.clearCookie("token")
    res.status(200).json({
        message: "User logout Successfully"
    })
}


/**
 * 
 * @route GET /api/auth/me
 * @description get the current logged-in user's information
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user._id)

    res.status(200).json({
        message: "User Details are : ",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }

    })


}



module.exports = {
    registerUserController,
    userLoginController,
    userLogoutController,
    getMeController
}