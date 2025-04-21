import asyncHandler from 'express-async-handler';
import Department from '../models/departmentModel.js';

// @route   GET /api/departments
// @access  Public
const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate({
    path: 'faculty',
    populate: { path: 'academicField' }
  });
  res.status(200).json(departments);
});

// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate({
    path: 'faculty',
    populate: { path: 'academicField' }
  });
  
  if (!department) {
    res.status(404);
    throw new Error('Bölüm bulunamadı');
  }
  
  res.status(200).json(department);
});

// @route   GET /api/departments/faculty/:facultyId
// @access  Public
const getDepartmentsByFaculty = asyncHandler(async (req, res) => {
  const departments = await Department.find({ faculty: req.params.facultyId }).populate('faculty');
  res.status(200).json(departments);
});

// @route   POST /api/departments
// @access  Private/Yönetici
const createDepartment = asyncHandler(async (req, res) => {
  const department = new Department(req.body);
  const newDepartment = await department.save();
  res.status(201).json(newDepartment);
});

// @route   PUT /api/departments/:id
// @access  Private/Yönetici
const updateDepartment = asyncHandler(async (req, res) => {
  const updatedDepartment = await Department.findByIdAndUpdate(
    req.params.id, 
    req.body,
    { new: true }
  );
  
  if (!updatedDepartment) {
    res.status(404);
    throw new Error('Bölüm bulunamadı');
  }
  
  res.status(200).json(updatedDepartment);
});

// @route   DELETE /api/departments/:id
// @access  Private/Yönetici
const deleteDepartment = asyncHandler(async (req, res) => {
  const deletedDepartment = await Department.findByIdAndDelete(req.params.id);
  
  if (!deletedDepartment) {
    res.status(404);
    throw new Error('Bölüm bulunamadı');
  }
  
  res.status(200).json({ message: 'Bölüm silindi' });
});

export {
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByFaculty,
  createDepartment,
  updateDepartment,
  deleteDepartment
};