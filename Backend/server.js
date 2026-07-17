const app = require('./src/app')
require('dotenv').config()   // needs to be required before any other module that uses process.env
const connectDB = require('./src/db/db')
connectDB();
app.listen(3000, () => {
    console.log("Server is running on port 3000")
})