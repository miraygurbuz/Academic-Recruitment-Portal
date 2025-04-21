import Application from '../models/applicationModel.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
    const {
        jobId,
        candidateId,
        academicFieldId,
        positionType,
        status,
        documents,
        publications,
        citations,
        projects,
        theses
    } = req.body;

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

    const validPublications = Array.isArray(publications) ?
        publications.filter(pub => pub.title && pub.category) : [];

    const validCitations = Array.isArray(citations) ?
        citations.filter(citation => citation.category && citation.publicationTitle) : [];

    const validProjects = Array.isArray(projects) ?
        projects.filter(project => project.category && project.title && project.role) : [];

    const validTheses = Array.isArray(theses) ?
        theses.filter(thesis => thesis.category && thesis.studentName && thesis.title) : [];

    const application = new Application({
        jobId,
        candidateId,
        academicFieldId,
        positionType,
        status: status || 'Beklemede',
        documents: documents || [],
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
            .populate('jobId', 'title department')
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
// @access  Private/Admin, Owner
const getApplicationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Geçersiz başvuru ID\'si');
    }

    const application = await Application.findById(id)
        .populate('candidateId', 'name surname email tcKimlik')
        .populate({
            path: 'jobId',
            select: 'title department',
            populate: {
                path: 'department',
                select: 'name'
            }
        })
        .populate('academicFieldId', 'name');

    if (!application) {
        res.status(404);
        throw new Error('Başvuru bulunamadı');
    }

    if (req.user.role !== 'Admin' && application.candidateId._id.toString() !== req.user._id.toString()) {
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

export { 
    createApplication, 
    getMyApplications,
    getAllApplications,
    getApplicationById,
    calculateApplicationPoints,
    checkApplicationCriteria,
    getJobApplications,
    getPendingApplicationCount,
    deleteApplication
};