import asyncHandler from 'express-async-handler';
import Faculty from '../models/facultyModel.js';

// @route   GET /api/faculties
// @access  Public
const getAllFaculties = asyncHandler(async (req, res) => {
  const faculties = await Faculty.find().populate('academicField');
  res.status(200).json(faculties);
});

// @route   GET /api/faculties/:id
// @access  Public
const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate('academicField');
  
  if (!faculty) {
    res.status(404);
    throw new Error('Fakülte bulunamadı');
  }
  
  res.status(200).json(faculty);
});

// @route   POST /api/faculties
// @access  Private/Yönetici
const createFaculty = asyncHandler(async (req, res) => {
  const faculty = new Faculty(req.body);
  const newFaculty = await faculty.save();
  res.status(201).json(newFaculty);
});

// @route   PUT /api/faculties/:id
// @access  Private/Yönetici
const updateFaculty = asyncHandler(async (req, res) => {
  const updatedFaculty = await Faculty.findByIdAndUpdate(
    req.params.id, 
    req.body,
    { new: true }
  );
  
  if (!updatedFaculty) {
    res.status(404);
    throw new Error('Fakülte bulunamadı');
  }
  
  res.status(200).json(updatedFaculty);
});

// @route   DELETE /api/faculties/:id
// @access  Private/Yönetici
const deleteFaculty = asyncHandler(async (req, res) => {
  const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
  
  if (!deletedFaculty) {
    res.status(404);
    throw new Error('Fakülte bulunamadı');
  }
  
  res.status(200).json({ message: 'Fakülte silindi' });
});

// @route   GET /api/academic-fields/:academicFieldId/faculties
// @access  Public
const getFacultiesByAcademicField = asyncHandler(async (req, res) => {
  const faculties = await Faculty.find({ 
    academicField: req.params.academicFieldId 
  }).select('name createdAt');

  if (!faculties || faculties.length === 0) {
    res.status(404);
    throw new Error('Bu akademik alana ait fakülte bulunamadı');
  }

  res.status(200).json(faculties);
});

export {
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultiesByAcademicField
};