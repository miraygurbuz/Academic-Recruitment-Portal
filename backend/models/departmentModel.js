import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
}, {timestamps: true});

const Department = mongoose.model('Department', departmentSchema);
export default Department;