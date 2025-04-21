import asyncHandler from 'express-async-handler';
import AcademicField from '../models/academicFieldModel.js';

// @route   GET /api/academic-fields
// @access  Public
const getAllAcademicFields = asyncHandler(async (req, res) => {
  const academicFields = await AcademicField.find();
  res.status(200).json(academicFields);
});

// @route   GET /api/academic-fields/:id
// @access  Public
const getAcademicFieldById = asyncHandler(async (req, res) => {
  const academicField = await AcademicField.findById(req.params.id);
  if (!academicField) {
    res.status(404);
    throw new Error('Akademik alan bulunamadı');
  }
  res.status(200).json(academicField);
});

// @route   POST /api/academic-fields
// @access  Private/Yönetici
const createAcademicField = asyncHandler(async (req, res) => {
  const academicField = new AcademicField(req.body);
  const newAcademicField = await academicField.save();
  res.status(201).json(newAcademicField);
});

// @route   PUT /api/academic-fields/:id
// @access  Private/Yönetici
const updateAcademicField = asyncHandler(async (req, res) => {
  const updatedAcademicField = await AcademicField.findByIdAndUpdate(
    req.params.id, 
    req.body,
    { new: true }
  );
  
  if (!updatedAcademicField) {
    res.status(404);
    throw new Error('Akademik alan bulunamadı');
  }
  
  res.status(200).json(updatedAcademicField);
});

// @route   DELETE /api/academic-fields/:id
// @access  Private/Yönetici
const deleteAcademicField = asyncHandler(async (req, res) => {
  const deletedAcademicField = await AcademicField.findByIdAndDelete(req.params.id);
  
  if (!deletedAcademicField) {
    res.status(404);
    throw new Error('Akademik alan bulunamadı');
  }
  
  res.status(200).json({ message: 'Akademik alan silindi' });
});

export {
  getAllAcademicFields,
  getAcademicFieldById,
  createAcademicField,
  updateAcademicField,
  deleteAcademicField
};