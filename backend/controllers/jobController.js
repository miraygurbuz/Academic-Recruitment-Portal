import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';
import User from '../models/userModel.js';
import { createNotification, notifyMultipleUsers } from '../services/notificationService.js';

// @route   GET /api/jobs
// @access  Public
const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate({
    path: 'department',
    populate: {
      path: 'faculty',
      populate: { path: 'academicField' }
    }
  }).populate('createdBy', 'name surname');
  
  res.status(200).json(jobs);
});

// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate({
    path: 'department',
    populate: {
      path: 'faculty',
      populate: { path: 'academicField' }
    }
  }).populate('createdBy', 'name surname');
  
  if (!job) {
    res.status(404);
    throw new Error('İş ilanı bulunamadı');
  }
  
  res.status(200).json(job);
});

// @route   GET /api/jobs/department/:departmentId
// @access  Public
const getJobsByDepartment = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ department: req.params.departmentId }).populate('department');
  res.status(200).json(jobs);
});

// @route   GET /api/jobs/active
// @access  Public
const getActiveJobs = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const activeJobs = await Job.find({
    status: 'Aktif',
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate }
  })
    .populate({
      path: 'department',
      populate: {
        path: 'faculty',
        populate: { path: 'academicField' }
      }
    })
    .sort({ startDate: -1 });

  res.status(200).json(activeJobs);
});


// @route   GET /api/jobs/active/count
// @access  Public
const getActiveJobCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const count = await Job.countDocuments({
    status: 'Aktif',
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate }
  });
  
  res.status(200).json({ count });
});

// @route   POST /api/jobs
// @access  Private/Admin
const createJob = asyncHandler(async (req, res) => {
  const job = new Job({
    ...req.body,
    createdBy: req.user._id
  });
  
  const newJob = await job.save();
  try {
    const managers = await User.find({ role: 'Yönetici' });
    if (managers.length > 0) {
      await notifyMultipleUsers(
        managers.map(manager => manager._id), 
        {
          type: 'system',
          title: `Yeni İlan Oluşturuldu`,
          message: `${job.title} ilanına jüri ataması yapabilirsiniz.`,
          relatedId: job._id,
          refModel: 'Job',
          url: `/manager/jobs/${job._id}/jury`,
        }
      );
    }
  } catch (error) {}

  res.status(201).json(newJob);
});

// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = asyncHandler(async (req, res) => {
  const updatedJob = await Job.findByIdAndUpdate(
    req.params.id, 
    req.body,
    { new: true }
  );
  
  if (!updatedJob) {
    res.status(404);
    throw new Error('İş ilanı bulunamadı');
  }
  
  res.status(200).json(updatedJob);
});

// @route   PATCH /api/jobs/:id/status
// @access  Private/Admin
const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['Aktif', 'Biten', 'Taslak', 'Değerlendirme'].includes(status)) {
    res.status(400);
    throw new Error('Geçersiz durum değeri');
  }
  
  const updatedJob = await Job.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  
  if (!updatedJob) {
    res.status(404);
    throw new Error('İş ilanı bulunamadı');
  }
  
  res.status(200).json(updatedJob);
});

// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = asyncHandler(async (req, res) => {
  const deletedJob = await Job.findByIdAndDelete(req.params.id);
  
  if (!deletedJob) {
    res.status(404);
    throw new Error('İş ilanı bulunamadı');
  }
  
  res.status(200).json({ message: 'İş ilanı silindi' });
});

// @route   GET /api/jobs/:id/jurymembers
// @access  Private/Admin,Yönetici
const getJobJuryMembers = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate({
      path: 'juryMembers.user',
      select: 'name surname tcKimlik email department',
      populate: { path: 'department', select: 'name' }
    });
  
  if (!job) {
    res.status(404);
    throw new Error('İlan bulunamadı');
  }
  
  res.status(200).json(job.juryMembers);
});

// @route   PUT /api/jobs/:id/jurymembers
// @access  Private/Admin,Yönetici
const assignJuryMembers = asyncHandler(async (req, res) => {
  const { juryMemberIds } = req.body;
  
  if (!juryMemberIds || juryMemberIds.length < 3 || juryMemberIds.length > 5) {
    return res.status(400).json({
      message: '3 ile 5 arası jüri üyesi seçilmelidir'
    });
  }
  
  const job = await Job.findById(req.params.id).populate('department');
  
  if (!job) {
    return res.status(404).json({
      message: 'İlan bulunamadı'
    });
  }

  if (job.status !== 'Aktif') {
    return res.status(400).json({
      message: 'Sadece aktif ilanlara jüri atama işlemi yapılabilir.'
    });
  }
  
  const juryMembers = await User.find({ 
    _id: { $in: juryMemberIds },
    role: 'Jüri Üyesi'
  });
  
  if (juryMembers.length !== juryMemberIds.length) {
    return res.status(400).json({
      message: 'Bazı jüri üyeleri bulunamadı veya jüri üyesi değil'
    });
  }
  
  const wrongDepartmentJuryMembers = juryMembers.filter(jury => 
    jury.department.toString() !== job.department._id.toString()
  );
  
  if (wrongDepartmentJuryMembers.length > 0) {
    return res.status(400).json({
      message: 'Tüm jüri üyeleri ilanın açıldığı bölüme ait olmalıdır'
    });
  }
  
  job.juryMembers = juryMemberIds.map(id => ({ user: id }));
  
  await job.save();

  const notificationPromises = juryMembers.map(member => 
    createNotification({
      recipientId: member._id,
      type: 'application',
      title: 'Jüri Ataması',
      message: `"${job.title}" ilanına jüri üyesi olarak atandınız.`,
      relatedId: job._id,
      refModel: 'Job',
      url: `/jury/jobs/${job._id}`,
    }).catch(error => {
      return null;
    })
  );

  await Promise.allSettled(notificationPromises);
  
  res.status(200).json({ 
    message: 'Jüri ataması başarıyla yapıldı',
    juryMembers: job.juryMembers 
  });
});

// @route   DELETE /api/jobs/:id/jurymembers
// @access  Private/Admin,Yönetici
const clearJuryMembers = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    res.status(404);
    throw new Error('İlan bulunamadı');
  }

  if (job.status !== 'Aktif') {
    res.status(400);
    throw new Error('Sadece aktif ilanlara jüri atama işlemi yapılabilir.');
  }
  
  job.juryMembers = [];
  await job.save();
  
  res.status(200).json({
    message: 'Jüri üyeleri başarıyla temizlendi',
    juryMembers: []
  });
});

// @route   GET /api/jobs/jury/assigned
// @access  Private/Jury
const getJuryAssignedJobs = asyncHandler(async (req, res) => {
  const juryId = req.user._id;
  const jobs = await Job.find({
    'juryMembers.user': juryId,
    status: { $in: ['Değerlendirme', 'Biten'] }
  })
  .populate({
    path: 'department',
    populate: {
      path: 'faculty',
      populate: { path: 'academicField' }
    }
  })
  .populate('createdBy', 'name surname')
  .sort('-createdAt');
  
  res.status(200).json(jobs);
});

export {
  getAllJobs,
  getJobById,
  getJobsByDepartment,
  getActiveJobs,
  getActiveJobCount,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  assignJuryMembers,
  getJobJuryMembers,
  clearJuryMembers,
  getJuryAssignedJobs
};