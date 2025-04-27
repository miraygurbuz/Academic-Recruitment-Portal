import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;
    token = req.cookies.jwt;

    if (token){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.userId).select('-password');

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Unauthorized. Invalid token.');
        }
     } else {
        res.status(401);
        throw new Error('Unauthorized. No token.');
    }
});

const admin = asyncHandler(async (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Yönetici')) {
        next();
    } else {
        res.status(403);
        throw new Error('Unauthorized.');
    }
});

const jury = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'Jüri Üyesi') {
        next();
    } else {
        res.status(403);
        throw new Error('Unauthorized.');
    }
});

export { protect, admin, jury };