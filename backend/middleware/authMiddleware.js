import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';

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
    if (req.user && req.user.role === 'Admin' || req.user.role === 'Yönetici') {
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

const downloadAuth = asyncHandler(async (req, res, next) => {
    try {
      const filename = req.params.filename;
      
      let application = await Application.findOne({
        'documents.fileUrl': { $regex: filename }
      });
      let isEvaluationReport = false;
      let evaluationOwner = null;
      if (!application) {
        application = await Application.findOne({
          'juryEvaluations.reportFileUrl': { $regex: filename }
        });
        if (application) {
          isEvaluationReport = true;
          const evaluation = application.juryEvaluations.find(
            evaluation => evaluation.reportFileUrl && evaluation.reportFileUrl.includes(filename)
          );
          if (evaluation) {
            evaluationOwner = evaluation.juryMember;
          }
        }
      }
      if (!application) {
        res.status(404);
        throw new Error('Dosya bulunamadı');
      }
      if (req.user.role === 'Admin' || req.user.role === 'Yönetici') {
        return next();
      }
      if (isEvaluationReport) {
        if (evaluationOwner && evaluationOwner.toString() === req.user._id.toString()) {
          return next();
        } else {
          res.status(403);
          throw new Error('Bu değerlendirme raporunu görme yetkiniz yok');
        }
      }
      if (application.candidateId.toString() === req.user._id.toString()) {
        return next();
      }
      if (req.user.role === 'Jüri Üyesi') {
        const job = await Job.findById(application.jobId);
        if (!job) {
          res.status(404);
          throw new Error('İlgili ilan bulunamadı');
        }
        const isJuryMember = job.juryMembers.some(member => 
          member.user && member.user.toString() === req.user._id.toString()
        );
        if (isJuryMember) {
          return next();
        }
      }
      res.status(403);
      throw new Error('Bu dosyayı indirme yetkiniz yok');
    } catch (error) {
      res.status(error.statusCode || 500);
      throw new Error(error.message || 'Dosya erişim yetkisi kontrol edilirken bir hata oluştu');
    }
  });

export { protect, admin, jury, downloadAuth};