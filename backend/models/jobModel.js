import mongoose from 'mongoose';

const jobSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    position: {
        type: String,
        enum: ['Dr. Öğr. Üyesi', 'Doçent', 'Profesör'],
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    requiredDocuments: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Aktif', 'Biten', 'Taslak', 'Değerlendirme'],
        default: 'Taslak'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    juryMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    }]
}, {timestamps: true});

jobSchema.virtual('faculty', {
    ref: 'Department',
    localField: 'department',
    foreignField: '_id',
    justOne: true,
    options: { populate: { path: 'faculty' } }
});

jobSchema.virtual('academicField', {
    ref: 'Department',
    localField: 'department',
    foreignField: '_id',
    justOne: true,
    options: { 
        populate: { 
            path: 'faculty', 
            populate: { path: 'academicField' } 
        } 
    }
});

jobSchema.methods.isJuryComplete = function() {
    const acceptedCount = this.juryMembers.filter(j => j.status === 'Kabul Edildi').length;
    return acceptedCount >= 5;
};

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;