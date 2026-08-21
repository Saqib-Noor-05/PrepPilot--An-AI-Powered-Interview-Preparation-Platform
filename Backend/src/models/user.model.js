const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username must be unique"],
        required: true
    },
    email: {
        type: String,
        unique: [true, "Email already registered."],
        required: true,


    },
    password: {
        type: String,
        required: true
    }
})

const userModel = mongoose.model("User", userSchema)
module.exports = userModel;