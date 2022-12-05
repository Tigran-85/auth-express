const express = require('express');
const router = express.Router();
const { emailCheck, passwordCheck, newPasswordCheck } = require('./middleware/validators');
const auth = require("./middleware/auth");

const { login, register, welcome, resetPassword, forgetPassword, checkTokenFromEmail } = require('./app');


router.post("/login", login)

    .post("/register", passwordCheck, emailCheck, register)

    .post("/reset", auth, newPasswordCheck, resetPassword)
    .post("/forget", newPasswordCheck, forgetPassword)
    .post("/check", checkTokenFromEmail)

    .get("/welcome", auth, welcome)

    .get('/', (req, res) => {
        res.send('hello')
    })

    .use("*", (req, res) => {
        res.status(404).json({
            success: "false",
            message: "Page not found",
            error: {
                statusCode: 404,
                message: "You reached a route that is not defined on this server",
            },
        });
    });

module.exports = router;