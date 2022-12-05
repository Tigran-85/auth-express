const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const emailSender = require("./middleware/emailSender");
const User = require('./model/user');

async function login(req, res) {

        const { email, password } = req.body;

        if (!(email && password)) {
           return  res.status(400).json("All inputs are required");
        }

        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).json("No such user");
        }

        const inputPassword = await bcrypt.compare(password, user.password);

        if (!(user && inputPassword)) {
            return res.status(400).json("Invalid Credentials");
        }

        const token = jwt.sign(
            { email },
            process.env.TOKEN_SECRET,
            {
                expiresIn: "1h",
            }
        )

        return res.status(200).json({
            status: "success",
            token
        });
}

async function register(req, res) {

        const { firstName, lastName, username, phone, email, password } = req.body;

        const userExists = await User.findOne({email});

        if (userExists) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        const checkPhoneNumber = /374(4[134]|55|77|88|9[134689])\d{6}/g;

        if (!(email && password && firstName && lastName && username && phone)) {
           return res.status(400).send("All input is required");
        }

        if (!checkPhoneNumber.test(phone)) {
            return res.status(400).send("Incorrect phone number format");
    }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()[0].msg });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        firstName,
        lastName,
        username,
        phone,
        email,
        password: encryptedPassword
    });
    await user.save();

        return  res.status(201)
                .json(
                    {
                        status: "success",
                        user
                    })
}

async function resetPassword(req, res) {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findOne({email});

    if (!user) {
        return res.status(400).json("No such user");
    }

    const isPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isPassword) {
        return res.status(400).json("Invalid password");
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json("Passwords do not match");
    }

    if (oldPassword === newPassword) {
        return res.status(400).json("You entered the old password");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200)
        .json({
            status: "success, your password has already been changed"
        })
}

async function forgetPassword(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json("Email must be provided");
    }

    const user = await User.findOne({email});

    if (!user) {
        return res.status(400).json("No such user");
    }

    const token = jwt.sign(
        { email },
        process.env.TOKEN_SECRET,
        {
            expiresIn: "1h",
        }
    )
    await emailSender(`<a href="http://localhost:4000/check?activation-code=${token}">Forgot password</a>`);

    return res.status(200).send("Link sent to your email");

}

async function checkTokenFromEmail(req, res) {
    const query = req.query['activation-code'];
    const { email, newPassword, confirmPassword } = req.body;

    try {
        jwt.verify(query, process.env.TOKEN_SECRET);
    } catch (e) {
        return res.status(400).json(e.message);
    }

    const userExists = await User.findOne({email});

    if (!userExists) {
        return res.status(400).json("Invalid email");
    }

    if (!(newPassword && confirmPassword)) {
        return res.status(400).json("All inputs are required");
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json("Passwords do not match");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    const user = await User.findOne({email});

    if (!user) {
        return res.status(400).send();
    }

    const hash = await bcrypt.hash(newPassword, 10);

    user.password = hash;
    await user.save();

    return res.status(200).json({
        status: "Success, password has already been changed",
    });
}

function welcome(req, res) {

    return res.status(200).send("Welcome 🙌 ");
}

module.exports = {
    login,
    register,
    welcome,
    resetPassword,
    forgetPassword,
    checkTokenFromEmail
}

