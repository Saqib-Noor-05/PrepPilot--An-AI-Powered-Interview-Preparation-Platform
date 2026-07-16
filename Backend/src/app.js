const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
const authRouter = require('./Routes/auth.route')

app.use('/api/auth', authRouter)

module.exports = app