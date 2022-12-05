const { body } = require('express-validator');


const emailCheck = body('email').isEmail().withMessage("Incorrect email");
const passwordCheck = body('password').isLength({ min: 10 }).withMessage("Password must be minimum 10 characters");
const newPasswordCheck = body('newPassword').isLength({ min: 10 }).withMessage("Password must be minimum 10 characters");

module.exports = {
    emailCheck,
    passwordCheck,
    newPasswordCheck
};
