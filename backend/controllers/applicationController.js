import Application from '../models/applicationModel.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Job from '../models/jobModel.js';
import path from 'path';
import { createNotification } from '../services/notificationService.js';
import { uploadToS3 } from '../services/cloudStorageService.js';

// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const {
    jobId,
    candidateId,
    academicFieldId,
    positionType,
    status,
  } = req.body;

  const parseIfString = (field) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return field;
  };

  const publications = parseIfString(req.body.publications);
  const citations = parseIfString(req.body.citations);
  const projects = parseIfString(req.body.projects);
  const theses = parseIfString(req.body.theses);

  const existingApplication = await Application.findOne({ 
    jobId, 
    candidateId 
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('Bu ilana daha önce başvuru yaptınız');
  }

  if (!jobId || !candidateId || !academicFieldId || !positionType) {
    res.status(400);
    throw new Error('Tüm zorunlu alanlar gereklidir');
  }

  const uploadedDocuments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const fileUrl = await uploadToS3(
          file.buffer, 
          file.originalname, 
          file.mimetype
        );
        
        uploadedDocuments.push({
          type: path.basename(file.originalname, path.extname(file.originalname)),
          fileUrl: fileUrl,
          originalName: file.originalname,
          uploadedAt: new Date()
        });
      } catch (error) {
        res.status(500);
        throw new Error('Dosya yüklenirken bir hata oluştu');
      }
    }
  }

  const validPublications = Array.isArray(publications)
    ? publications.filter(pub => pub.title && pub.category)
    : [];

  const validCitations = Array.isArray(citations)
    ? citations.filter(citation => citation.category && citation.publicationTitle)
    : [];

  const validProjects = Array.isArray(projects)
    ? projects.filter(project => project.category && project.title)
    : [];

  const validTheses = Array.isArray(theses)
    ? theses.filter(thesis => thesis.category && thesis.studentName && thesis.title)
    : [];

  const application = new Application({
    jobId,
    candidateId,
    academicFieldId,
    positionType,
    status: status || 'Beklemede',
    documents: uploadedDocuments,
    publications: validPublications,
    citations: validCitations,
    projects: validProjects,
    theses: validTheses,
    submittedAt: new Date()
  });

  const createdApplication = await application.save();
  res.status(201).json(createdApplication);
});

// @route   GET /api/applications/my
// @access  Private
const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({ candidateId: req.user._id })
        .populate('jobId')
        .sort('-createdAt');
    
    res.json(applications);
});

// @route   GET /api/applications
// @access  Private/Admin
const getAllApplications = asyncHandler(async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('candidateId', 'name surname email')
            .populate({
                path: 'jobId',
                select: 'title department juryMembers status',
                populate: [
                    {
                        path: 'department',
                        select: 'name'
                    },
                    {
                        path: 'juryMembers.user',
                        select: 'name surname email department', 
                        populate: {
                            path: 'department',
                            select: 'name'
                        }
                    }
                ]
            })
            .populate('academicFieldId', 'name');

        const totalApplications = await Application.countDocuments();

        res.json({
            applications,
            totalApplications
        });
    } catch (error) {
        res.status(500).json({
            message: 'Başvuruları getirirken hata oluştu',
            error: error.message
        });
    }
});

// @route   GET /api/applications/pending/count
// @access  Private/Admin
const getPendingApplicationCount = asyncHandler(async (req, res) => {
    const count = await Application.countDocuments({ status: 'Beklemede' });
    
    res.json({ count });
  });

// @route   GET /api/applications/:id
// @access  Private/Admin, Owner, Yönetici
const getApplicationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Geçersiz başvuru ID\'si');
    }

    const includeDetails = req.query.includeDetails === 'true';

    let query = Application.findById(id)
        .populate('candidateId', 'name surname email tcKimlik')
        .populate({
            path: 'jobId',
            select: 'title department faculty juryMembers',
            populate: [
                {
                    path: 'department',
                    select: 'name faculty'
                },
                {
                    path: 'juryMembers.user',
                    select: 'name surname email'
                }
            ]
        })
        .populate('academicFieldId', 'name')
        .populate({
            path: 'juryEvaluations.juryMember',
            select: 'name surname email'
        });

    if (includeDetails) {
        query = query
            .populate('publications')
            .populate('citations')
            .populate('projects')
            .populate('theses')
            .populate('pointsSummary');
    }

    const application = await query;

    if (!application) {
        res.status(404);
        throw new Error('Başvuru bulunamadı');
    }

    if (req.user.role !== 'Admin' && 
        req.user.role !== 'Yönetici' &&
        application.candidateId._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Bu başvuruyu görüntüleme yetkiniz yok');
    }

    res.json(application);
});

// @route   GET /api/applications/:id/calculate-points
// @access  Private/Admin
const calculateApplicationPoints = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const application = await Application.findById(id);
    
    if (!application) {
        res.status(404);
        throw new Error('Başvuru bulunamadı');
    }

    const pointsSummary = await application.calculatePoints();
    res.json(pointsSummary);
});

// @route   GET /api/applications/:id/check-criteria
// @access  Private/Admin
const checkApplicationCriteria = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const application = await Application.findById(id);
    
    if (!application) {
        res.status(404);
        throw new Error('Başvuru bulunamadı');
    }

    const criteriaCheck = await application.checkCriteria();
    res.json(criteriaCheck);
});

// @route   GET /api/applications/job/:jobId
// @access  Private/Admin
const getJobApplications = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        res.status(400);
        throw new Error('Geçersiz ilan ID\'si');
    }

    const applications = await Application.find({ jobId })
        .populate('candidateId', 'name surname')
        .populate('academicFieldId', 'name')
        .sort('-createdAt');

        if (!applications || applications.length === 0) {
            return res.json({ 
                message: 'Bu ilan için henüz başvuru yapılmamış.',
                applications: [],
                jobId: jobId
            });
        }

    res.json({ applications });
});

// @route   DELETE /api/applications/:id
// @access  Private/Admin, Owner
const deleteApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Geçersiz başvuru ID\'si.');
    }

    const application = await Application.findById(id);

    if (!application) {
        res.status(404);
        throw new Error('Başvuru bulunamadı.');
    }

    if (application.status !== 'Beklemede') {
        res.status(400);
        throw new Error('Sadece "Beklemede" durumundaki başvurular geri çekilebilir.');
    }

    if (req.user.role !== 'Admin' && application.candidateId._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Yetki yok.');
      }

    await Application.findByIdAndDelete(id);

    res.status(200).json({ 
        message: 'Başvuru başarıyla silindi.', 
        id: id 
    });
});

// @route   PUT /api/applications/:id
// @access  Private/Admin, Yönetici
const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Geçersiz başvuru ID\'si');
  }

  const application = await Application.findById(id);

  if (!application) {
      res.status(404);
      throw new Error('Başvuru bulunamadı');
  }

  if (req.user.role !== 'Admin' && req.user.role !== 'Yönetici') {
      res.status(403);
      throw new Error('Bu işlemi gerçekleştirme yetkiniz yok');
  }
  if (status) {
      const validStatuses = ['Beklemede', 'Onaylandı', 'Reddedildi'];
      if (!validStatuses.includes(status)) {
          res.status(400);
          throw new Error('Geçersiz başvuru durumu');
      }

      if (application.status === 'Onaylandı' || application.status === 'Reddedildi') {
          res.status(400);
          throw new Error('Başvuru onay/ret işlemleri tamamlandığından değişiklik yapamazsınız');
      }
      
      if (status === 'Onaylandı' || status === 'Reddedildi') {
          const job = await Job.findById(application.jobId).populate('juryMembers.user');
          
          if (!job) {
              res.status(404);
              throw new Error('İlgili ilan bulunamadı');
          }
          
          const juryMemberCount = job.juryMembers.length;
          const evaluationCount = application.juryEvaluations ? application.juryEvaluations.length : 0;
          
          if (juryMemberCount === 0){
            res.status(400);
            throw new Error('Jüri üyesi atanmadan ve jüri değerlendirmeleri tamamlanmadan başvuru onaylanamaz/reddedilemez');
          }

          if (evaluationCount < juryMemberCount) {
              res.status(400);
              throw new Error('Tüm jüri üyeleri değerlendirme yapmadan başvuru onaylanamaz/reddedilemez');
          }
          
          application.completedAt = new Date();
          
          try {
            await createNotification({
              recipientId: application.candidateId,
              type: 'status',
              title: `Başvurunuz ${status === 'Onaylandı' ? 'onaylandı' : 'reddedildi'}`,
              message: `${job.title} ilanına yaptığınız başvuru ${status.toLowerCase()}.`,
              relatedId: application._id,
              refModel: 'Application',
              url: `/my-applications/${application._id}`,
            });
          } catch (error) {}         
      }

      application.status = status;
  }
  
  await application.calculatePoints();
  await application.checkCriteria();
  
  if (status === 'Onaylandı' || status === 'Reddedildi') {
    application.completedAt = new Date();
  }

  const updatedApplication = await application.save();

  res.json(updatedApplication);
});

// @route   GET /api/applications/jury/job/:jobId
// @access  Private/Jüri Üyesi
const getJuryJobApplications = asyncHandler(async (req, res) => {
  const juryId = req.user._id;
  const { jobId } = req.params;
  
  const job = await Job.findById(jobId);
  
  if (!job) {
    res.status(404);
    throw new Error('İlan bulunamadı');
  }
  
  const isAssigned = job.juryMembers.some(jury => 
    jury.user.toString() === juryId.toString()
  );
  
  if (!isAssigned) {
    res.status(403);
    throw new Error('Bu ilana atanmadınız');
  }
  
  const applications = await Application.find({ jobId })
    .populate('candidateId', 'name surname tcKimlik')
    .populate('academicFieldId', 'name')
    .select('status pointsSummary criteriaCheck submittedAt completedAt')
    .sort('-submittedAt');
  
  res.status(200).json(applications);
});

// @route   GET /api/applications/jury/:applicationId
// @access  Private/Jüri Üyesi
const getApplicationByIdForJury = asyncHandler(async (req, res) => {
  const juryId = req.user._id;
  const { applicationId } = req.params;
  const includeDetails = req.query.includeDetails === 'true';
  
  let query = Application.findById(applicationId)
    .populate('candidateId', 'name surname email tcKimlik')
    .populate({
      path: 'jobId',
      select: 'title department juryMembers',
      populate: {
        path: 'department',
        select: 'name faculty',
        populate: {
          path: 'faculty',
          select: 'name'
        }
      }
    })
    .populate('academicFieldId', 'name')
    .populate({
      path: 'juryEvaluations.juryMember',
      select: 'name surname'
    });
  
  if (includeDetails) {
    query = query
      .populate('publications')
      .populate('citations')
      .populate('projects')
      .populate('theses')
      .populate('pointsSummary');
  }
  
  const application = await query;
  
  if (!application) {
    res.status(404);
    throw new Error('Başvuru bulunamadı');
  }
  
  const isAssigned = application.jobId.juryMembers.some(jury => 
    jury.user && jury.user.toString() === juryId.toString()
  );
  
  if (!isAssigned) {
    res.status(403);
    throw new Error('Bu başvuruyu değerlendirme yetkiniz yok');
  }
  
  const response = application.toObject();
  response.juryEvaluations = application.juryEvaluations.filter(
    evaluation => evaluation.juryMember && evaluation.juryMember._id.toString() === juryId.toString()
  );
     
  res.status(200).json(response);
});

// @route   POST /api/applications/jury/:applicationId/evaluate
// @access  Private/Jüri Üyesi
const evaluateApplication = asyncHandler(async (req, res) => {
  const juryId = req.user._id;
  const { applicationId } = req.params;
  const { result, comments } = req.body;
  
  if (!['Olumlu', 'Olumsuz'].includes(result)) {
    res.status(400);
    throw new Error('Geçersiz değerlendirme sonucu. Olumlu veya Olumsuz olmalıdır.');
  }
  
  const application = await Application.findById(applicationId);
  if (!application) {
    res.status(404);
    throw new Error('Başvuru bulunamadı');
  }
  
  const job = await Job.findById(application.jobId);
  if (!job) {
    res.status(404);
    throw new Error('İlan bulunamadı');
  }
  
  if (job.status !== 'Değerlendirme') {
    res.status(403);
    throw new Error('Bu başvuru şu anda değerlendirmeye açık değil. İlanın durumu "Değerlendirme" olmalıdır.');
  }
  
  const isAssigned = job.juryMembers.some(jury => 
    jury.user.toString() === juryId.toString()
  );
  
  if (!isAssigned) {
    res.status(403);
    throw new Error('Bu başvuruyu değerlendirme yetkiniz yok');
  }
  
  const evaluationIndex = application.juryEvaluations.findIndex(
    evaluation => evaluation.juryMember.toString() === juryId.toString()
  );
  
  if (evaluationIndex >= 0) {
    res.status(400);
    throw new Error('Bu başvuru için zaten bir değerlendirme yapmışsınız. Tekrar değerlendirme yapamazsınız.');
  }
  
  let reportData = {};
  if (req.file) {
    try {
      const fileUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      reportData = {
        reportFileUrl: fileUrl,
        reportOriginalName: req.file.originalname
      };
    } catch (error) {
      res.status(500);
      throw new Error('Rapor yüklenirken bir hata oluştu');
    }
  }
  
  application.juryEvaluations.push({
    juryMember: juryId,
    result,
    comments,
    ...reportData,
    evaluatedAt: Date.now()
  });
  
  await application.save();
  
  res.status(200).json({ 
    message: 'Değerlendirme başarıyla kaydedildi',
    evaluation: application.juryEvaluations.find(e => e.juryMember.toString() === juryId.toString())
  });
});

// @route   PUT /api/applications/jury/:applicationId/evaluate
// @access  Private/Jüri Üyesi
const updateEvaluation = asyncHandler(async (req, res) => {
  const juryId = req.user._id;
  const { applicationId } = req.params;
  const { result, comments } = req.body;

  if (!['Olumlu', 'Olumsuz'].includes(result)) {
    res.status(400);
    throw new Error('Geçersiz değerlendirme sonucu. Olumlu veya Olumsuz olmalıdır.');
  }
  
  const application = await Application.findById(applicationId);
  if (!application) {
    res.status(404);
    throw new Error('Başvuru bulunamadı');
  }

  if (application.status !== 'Beklemede') {
    return res.status(403).json({
      message: 'Başvuru nihai karara ulaşmış. Jüri değerlendirmesinde değişiklik yapılamaz.'
    });
  }
  
  const job = await Job.findById(application.jobId);
  if (!job) {
    res.status(404);
    throw new Error('İlan bulunamadı');
  }
  
  if (job.status !== 'Değerlendirme') {
    res.status(403);
    throw new Error('Bu başvuru şu anda değerlendirmeye açık değil. İlanın durumu "Değerlendirme" olmalıdır.');
  }
  
  const isAssigned = job.juryMembers.some(jury => 
    jury.user.toString() === juryId.toString()
  );
  
  if (!isAssigned) {
    res.status(403);
    throw new Error('Bu başvuruyu değerlendirme yetkiniz yok');
  }
  
  const evaluationIndex = application.juryEvaluations.findIndex(
    evaluation => evaluation.juryMember.toString() === juryId.toString()
  );
  
  if (evaluationIndex === -1) {
    res.status(404);
    throw new Error('Güncellenecek bir değerlendirme bulunamadı. Önce değerlendirme yapmalısınız.');
  }
  
  application.juryEvaluations[evaluationIndex].result = result;
  application.juryEvaluations[evaluationIndex].comments = comments;
  application.juryEvaluations[evaluationIndex].updatedAt = Date.now();
  
  if (req.file) {
    try {
      const fileUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      application.juryEvaluations[evaluationIndex].reportFileUrl = fileUrl;
      application.juryEvaluations[evaluationIndex].reportOriginalName = req.file.originalname;
    } catch (error) {
      res.status(500);
      throw new Error('Rapor güncellenirken bir hata oluştu');
    }
  }
  
  await application.save();
  
  res.status(200).json({ 
    message: 'Değerlendirme başarıyla güncellendi',
    evaluation: application.juryEvaluations[evaluationIndex]
  });
});

export { 
    createApplication, 
    getMyApplications,
    getAllApplications,
    getApplicationById,
    calculateApplicationPoints,
    checkApplicationCriteria,
    getJobApplications,
    getPendingApplicationCount,
    deleteApplication,
    updateApplication,
    getJuryJobApplications,
    getApplicationByIdForJury,
    evaluateApplication,
    updateEvaluation,
};