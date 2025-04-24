import mongoose from 'mongoose';

const documentSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const publicationSchema = mongoose.Schema({
    category: {
        type: String,
        enum: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    authors: {
        type: String,
        required: true
    },
    journal: {
        type: String,
        required: true
    },
    year: Number,
    doi: String,
    isMainAuthor: {
        type: Boolean,
        default: false
    },
    points: {
        type: Number,
        default: 0
    },
    fileUrl: String
});

const citationSchema = mongoose.Schema({
    category: {
        type: String,
        enum: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'],
        required: true
    },
    publicationTitle: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
        default: 1
    },
    points: {
        type: Number,
        default: 0
    }
});

const thesisSchema = mongoose.Schema({
    category: {
        type: String,
        enum: ['F1', 'F2', 'F3', 'F4'],
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    year: Number,
    points: {
        type: Number,
        default: 0
    }
});

const projectSchema = mongoose.Schema({
    category: {
        type: String,
        enum: [
              'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10',
              'H11', 'H12', 'H13', 'H14', 'H15', 'H16', 'H17', 'H18', 'H19',
              'H20', 'H21', 'H22', 'H23', 'H24', 'H25', 'H26', 'H27', 'H28',
            ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    fundingAgency: String,
    year: Number,
    budget: Number,
    points: {
        type: Number,
        default: 0
    }
});

const juryEvaluationSchema = mongoose.Schema({
    juryMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    result: {
        type: String,
        enum: ['Olumlu', 'Olumsuz', 'Beklemede'],
        default: 'Olumlu'
    },
    comments: String,
    evaluatedAt: {
        type: Date,
        default: Date.now
    }
});

const pointsSummarySchema = mongoose.Schema({
    publications: { type: Number, default: 0 },
    citations: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    theses: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
});

const criteriaCheckSchema = mongoose.Schema({
    totalPointsMet: { type: Boolean, default: false },
    totalArticlesMet: { type: Boolean, default: false },
    mainAuthorMet: { type: Boolean, default: false },
    a1a4Met: { type: Boolean, default: false },
    projectMet: { type: Boolean, default: false },
    thesisMet: { type: Boolean, default: false },
    minPointsMet: { type: Boolean, default: false },
    overallResult: { type: Boolean, default: false }
});

const applicationSchema = mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    academicFieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicField',
        required: true
    },
    positionType: {
        type: String,
        enum: ['Dr. Öğr. Üyesi', 'Doçent', 'Profesör'],
        required: true
    },
    status: {
        type: String,
        enum: ['Beklemede', 'Onaylandı', 'Reddedildi'],
        default: 'taslak'
    },
    
    documents: [documentSchema],
    publications: [publicationSchema],
    citations: [citationSchema],
    projects: [projectSchema],
    theses: [thesisSchema],
    
    pointsSummary: pointsSummarySchema,
    criteriaCheck: criteriaCheckSchema,
    juryEvaluations: [juryEvaluationSchema],
    
    submittedAt: Date,
    completedAt: Date
}, {timestamps: true});

applicationSchema.methods.calculatePoints = async function() {
    try {
        const AcademicField = mongoose.model('AcademicField');
        const academicField = await AcademicField.findById(this.academicFieldId);
        
        if (!academicField) {
            throw new Error("Akademik alan bulunamadı");
        }
        
        let publicationsTotal = 0;
        let citationsTotal = 0;
        let projectsTotal = 0;
        let thesesTotal = 0;
        
        for (const pub of this.publications) {
            pub.points = academicField.points[pub.category] || 0;
            publicationsTotal += pub.points;
        }
        
        for (const citation of this.citations) {
            citation.points = (academicField.points[citation.category] || 0) * citation.count;
            citationsTotal += citation.points;
        }
        
        for (const project of this.projects) {
            project.points = academicField.points[project.category] || 0;
            projectsTotal += project.points;
        }
        
        for (const thesis of this.theses) {
            thesis.points = academicField.points[thesis.category] || 0;
            thesesTotal += thesis.points;
        }
        
        this.pointsSummary = {
            publications: publicationsTotal,
            citations: citationsTotal,
            projects: projectsTotal,
            theses: thesesTotal,
            other: 0,
            total: publicationsTotal + citationsTotal + projectsTotal + thesesTotal
        };
        
        await this.save();
        return this.pointsSummary;
    } catch (error) {
        console.error("Puan hesaplama hatası:", error);
        throw error;
    }
};

applicationSchema.methods.checkCriteria = async function() {
    try {
        const AcademicField = mongoose.model('AcademicField');
        const academicField = await AcademicField.findById(this.academicFieldId);
        
        if (!academicField) {
            throw new Error("Akademik alan bulunamadı");
        }
        
        let criteria;
        if (this.positionType === 'Dr. Öğr. Üyesi') {
            criteria = academicField.criteria.drOgrUyesiCriteria;
        } else if (this.positionType === 'Doçent') {
            criteria = academicField.criteria.docentCriteria;
        } else if (this.positionType === 'Profesör') {
            criteria = academicField.criteria.professorCriteria;
        } else {
            throw new Error("Geçersiz pozisyon türü");
        }
        
        if (!criteria) {
            throw new Error("Pozisyon için kriter tanımlanmamış");
        }
        
        const totalPointsMet = this.pointsSummary.total >= criteria.requiredPoints;
        
        const totalArticles = this.publications.length;
        const totalArticlesMet = totalArticles >= criteria.totalArticles;
        
        const mainAuthorCount = this.publications.filter(pub => pub.isMainAuthor).length;
        const mainAuthorMet = mainAuthorCount >= criteria.asMainAuthor;
        
        const a1a4Publications = this.publications.filter(pub => 
            ['A1', 'A2', 'A3', 'A4'].includes(pub.category)
        );
        const a1a4Met = a1a4Publications.length >= criteria.A1A4;
        
        let projectMet = true;
        if (criteria.H1H12orH13H17 || criteria.H1H12orH13H22) {
            const h1h12Projects = this.projects.filter(proj => 
                ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12'].includes(proj.category)
            );
            
            const h13h17Projects = this.projects.filter(proj => 
                ['H13', 'H14', 'H15', 'H16', 'H17'].includes(proj.category)
            );
            
            const h13h22Projects = this.projects.filter(proj => 
                ['H13', 'H14', 'H15', 'H16', 'H17', 'H18', 'H19', 'H20', 'H21', 'H22'].includes(proj.category)
            );
            
            if (criteria.H1H12orH13H17) {
                projectMet = h1h12Projects.length > 0 || h13h17Projects.length > 0;
            }
            
            if (criteria.H1H12orH13H22) {
                projectMet = projectMet && (h1h12Projects.length > 0 || h13h22Projects.length > 0);
            }
        }
        
        let thesisMet = true;
        if (criteria.F1orF2) {
            const f1f2Theses = this.theses.filter(thesis => 
                ['F1', 'F2'].includes(thesis.category)
            );
            thesisMet = f1f2Theses.length > 0;
        }
        
        let minPointsMet = true;
        if (criteria.minPoints) {
            if (criteria.minPoints.A1A4 > 0) {
                const a1a4Points = a1a4Publications.reduce((sum, pub) => sum + pub.points, 0);
                minPointsMet = minPointsMet && (a1a4Points >= criteria.minPoints.A1A4);
            }
        
            if (criteria.minPoints.A1A5 > 0) {
                const a1a5Publications = this.publications.filter(pub => 
                    ['A1', 'A2', 'A3', 'A4', 'A5'].includes(pub.category)
                );
                const a1a5Points = a1a5Publications.reduce((sum, pub) => sum + pub.points, 0);
                minPointsMet = minPointsMet && (a1a5Points >= criteria.minPoints.A1A5);
            }
            
            if (criteria.minPoints.A1A6 > 0) {
                const a1a6Publications = this.publications.filter(pub => 
                    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].includes(pub.category)
                );
                const a1a6Points = a1a6Publications.reduce((sum, pub) => sum + pub.points, 0);
                minPointsMet = minPointsMet && (a1a6Points >= criteria.minPoints.A1A6);
            }
            
            if (criteria.minPoints.F1F2 > 0) {
                const f1f2Theses = this.theses.filter(thesis => 
                    ['F1', 'F2'].includes(thesis.category)
                );
                const f1f2Points = f1f2Theses.reduce((sum, thesis) => sum + thesis.points, 0);
                minPointsMet = minPointsMet && (f1f2Points >= criteria.minPoints.F1F2);
            }
            
            if (criteria.minPoints.H > 0) {
                const projectPoints = this.projects.reduce((sum, project) => sum + project.points, 0);
                minPointsMet = minPointsMet && (projectPoints >= criteria.minPoints.H);
            }
        }
        
        const overallResult = totalPointsMet && totalArticlesMet && mainAuthorMet && 
                              a1a4Met && projectMet && thesisMet && minPointsMet;
        
        this.criteriaCheck = {
            totalPointsMet,
            totalArticlesMet,
            mainAuthorMet,
            a1a4Met,
            projectMet,
            thesisMet,
            minPointsMet,
            overallResult
        };
        
        await this.save();
        return this.criteriaCheck;
    } catch (error) {
        console.error("Kriter kontrol hatası:", error);
        throw error;
    }
};

applicationSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    
    if (newStatus === 'Beklemede') {
        this.submittedAt = new Date();
    } else if (['Beklemede', 'Onaylandı', 'Reddedildi'].includes(newStatus)) {
        this.completedAt = new Date();
    }
    
    return this.save();
};

const Application = mongoose.model('Application', applicationSchema);
export default Application;