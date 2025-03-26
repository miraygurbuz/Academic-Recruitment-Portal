import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import { verifyTCKimlik } from '../services/nviService.js';

// @route   POST api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { tcKimlik, password } = req.body;
    const user = await User.findOne({ tcKimlik });
    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
        });
    } else {
        res.status(401);
        throw new Error('Geçersiz TC Kimlik No ya da şifre.');
    }
});

// @route   POST api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, surname, tcKimlik, birthYear } = req.body;
  
    if (!name || !email || !password || !surname || !tcKimlik || !birthYear) {
      res.status(400);
      throw new Error('Lütfen tüm alanları doldurun.');
    }
  
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Bu email adresi zaten kullanılıyor.');
    }
  
    const tcKimlikExists = await User.findOne({ tcKimlik });
    if (tcKimlikExists) {
      res.status(400);
      throw new Error('Kimlik bilgilerine ait kayıt bulundu.');
    }
  
    try {
      const isVerified = await verifyTCKimlik(tcKimlik, name, surname, birthYear);
      
      if (!isVerified) {
        res.status(400);
        throw new Error('Kimlik bilgileri doğrulanamadı.');
      }
    } catch (error) {
      res.status(500);
      throw new Error(error.message);
    }
  
    try {
      const user = await User.create({
        name,
        surname,
        email,
        password,
        tcKimlik,
        birthYear
      });
    
      if (user) {
        generateToken(res, user._id);
    
        res.status(201).json({
          _id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          tcKimlik: user.tcKimlik,
          birthYear: user.birthYear
        });
      } else {
        res.status(400);
        throw new Error('Geçersiz kullanıcı verisi.');
      }
    } catch (userCreateError) {
      res.status(400);
      throw new Error('Kullanıcı oluşturulamadı: ' + userCreateError.message);
    }
  });
  

// @route   POST api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
    })

    res.status(200).json({message: 'Kullanıcı çıkışı yapıldı.'});
});

// @route   GET api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        surname: req.user.surname,
        email: req.user.email,
        tcKimlik: req.user.tcKimlik,
    }
    res.status(200).json(user);
});

// @route   PUT api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user){
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                res.status(400);
                throw new Error("Bu email adresi bir başkası tarafından alınmış.");
            }
        }
        user.name = req.body.name || user.name;
        user.surname = req.body.surname || user.surname;
        user.email = req.body.email|| user.email;
        if (req.body.password) {
            if (!req.body.currentPassword) {
                res.status(400);
                throw new Error("Mevcut şifre gereklidir.");
            }

            const isMatch = await user.matchPassword(req.body.currentPassword);
            if (!isMatch) {
                res.status(400);
                throw new Error("Mevcut şifre hatalı.");
            }

            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            surname: updatedUser.surname,
            email: updatedUser.email,         
        });
    }else {
        res.status(404);
        throw new Error("Kullanıcı bulunamadı.");
    }
});

export{
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
};