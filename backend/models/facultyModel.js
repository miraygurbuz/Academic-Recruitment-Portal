import mongoose from 'mongoose';

const facultySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  academicField: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicField',
    required: true
  },
}, {timestamps: true});

  const Faculty = mongoose.model('Faculty', facultySchema);
  export default Faculty;