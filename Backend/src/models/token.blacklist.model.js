/**
 * collect the token
 * 
 */

const mongoose = require('mongoose');
const blSchema = mongoose.Schema({
    token: {
        type: String,
        required: true

    }

},
    { timestamps: true }
)

blSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 30     //Token expires after 30days
})
const blacklistModel = mongoose.model("blacklistedTokens", blSchema)

module.exports = blacklistModel