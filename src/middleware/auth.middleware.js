import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    try {
        //get token
        const token  = req.header("Authorization").replace("Bearer ", "");
        if(!token) return res.status(401).json({message: "No Authentication token, access denied"});

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.status(401).json({message: "Invalid token entered"});

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protect route:", error.message);
        return res.status(500).json({message: "It's not you it's me. Let's give it another go"});
    }
}

export default protectRoute