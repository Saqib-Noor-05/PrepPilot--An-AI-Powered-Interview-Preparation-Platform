const { body, validationResult } = require('express-validator')

async function validateResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    next();
}
const registerUserValidationRules = [
    body("username")
        .trim()
        .notEmpty().withMessage("username is required for  registration")
        .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/)
        .isString().withMessage("username must be a string")
        .isLength({ min: 3, max: 20 }),

    body("email")
        .trim()
        .isLowercase()
        .notEmpty().withMessage("Email is required")
        .isEmail()
        .normalizeEmail(), // this rule allow Saqib@gmail.com -->-later->saqib@gmail.com

    body("password")
        .isLength({ min: 6, max: 30 }),

    validateResult

]

module.exports = { registerUserValidationRules }