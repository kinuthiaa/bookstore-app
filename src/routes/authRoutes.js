import express from 'express'
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign(
        { userId }, process.env.JWT_SECRET,
        { expiresIn: "21d" }
    )
}

router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required for signup except the profile image" });
        }
        if (password.length < 8) { return res.status(400).json({ message: "The password must be at least 8 characters minimum for the best security" }); }

        if (username.length < 2) { return res.status(400).json({ message: "Your username can't be this short " }); }


        //check existence
        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ message: `${email} already exists with another account` });
        }

        const existusername = await User.findOne({ username });
        if (existusername) {
            return res.status(400).json({ message: `${username} already exists with another account` });
        }


        //generate random avatar
        const profileImg = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImg
        });

        await User.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.name,
                profileImg: user.profileImg
            }
        })
    } catch (error) {
        console.error("Error in registration route:", error.message);
        return res.status(500).json({ message: "It's not you it's me give me another chance!" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json({message: "All fields are required"});


        //check existence
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: `${email} does not exist`});

        //if password is correct
        const matchPassword = await user.comparePassword(password);

        if(!matchPassword) return res.status(400).json({message: "Invalid Credentials"});

        //generate token
        const token = generateToken(user._id);

        res.status(200).json({
            token, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImg: user.profileImg
            }
        });

    } catch (error) {
        console.error("Error in login route:", error.message);
        return res.status(500).json({ message: "It's not you it's me give me another chance!" });
    }
});



export default router;