const express = require('express')
const app = express()
const authRouter = require('./Routes/auth.route')
const interviewRouter = require('./Routes/interview.routes')
const cors = require('cors')
const cookieParser = require('cookie-parser')
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use('/api/auth', authRouter)
app.use('/api/interview', interviewRouter)


module.exports = app