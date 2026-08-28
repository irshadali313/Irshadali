import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const SocialLinkSchema = new Schema(
    { name: String, url: String },
    { _id: false },
);

const StackItemSchema = new Schema(
    { name: String, icon: String },
    { _id: false },
);

const ExperienceSchema = new Schema(
    { title: String, company: String, duration: String },
    { _id: false },
);

const ProjectSchema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true },
        year: Number,
        description: String,
        role: String,
        techStack: [String],
        thumbnail: String,
        longThumbnail: String,
        images: [String],
        liveUrl: String,
        sourceCode: String,
    },
    { _id: false },
);

const CertificateSchema = new Schema(
    {
        id: { type: String, required: true },
        title: { type: String, required: true },
        issuer: String,
        date: String,
        image: String,
        url: String,
    },
    { _id: false },
);

const InquirySchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
        company: { type: String, trim: true, maxlength: 160 },
        projectType: { type: String, required: true, maxlength: 40 },
        budget: { type: String, required: true, maxlength: 40 },
        timeline: { type: String, required: true, maxlength: 80 },
        details: { type: String, required: true, maxlength: 4000 },
        status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    },
    { timestamps: true },
);

// ── Main Portfolio Schema ─────────────────────────────────────────────────────

export interface IPortfolioDocument extends Document {
    generalInfo: {
        email: string;
        emailSubject: string;
        emailBody: string;
        oldPortfolio: string;
        upworkProfile: string;
        developerTitle: string;
        firstName: string;
        fullName: string;
    };
    socialLinks: Array<{ name: string; url: string }>;
    myStack: {
        frontend: Array<{ name: string; icon: string }>;
        backend: Array<{ name: string; icon: string }>;
        database: Array<{ name: string; icon: string }>;
        tools: Array<{ name: string; icon: string }>;
    };
    myExperience: Array<{ title: string; company: string; duration: string }>;
    projects: Array<{
        title: string;
        slug: string;
        year: number;
        description: string;
        role: string;
        techStack: string[];
        thumbnail: string;
        longThumbnail: string;
        images: string[];
        liveUrl?: string;
        sourceCode?: string;
    }>;
    bannerStats: {
        yearsExperience: string;
        completedProjects: string;
        hoursWorked: string;
        availableStatus: string;
    };
    aboutMe: {
        headline: string;
        bio1: string;
        bio2: string;
    };
    certificates: Array<{
        id: string;
        title: string;
        issuer: string;
        date: string;
        image: string;
        url?: string;
    }>;
    inquiries: Array<{
        _id: string;
        name: string;
        email: string;
        company?: string;
        projectType: string;
        budget: string;
        timeline: string;
        details: string;
        status: 'new' | 'contacted' | 'closed';
        createdAt: Date;
    }>;
}

const PortfolioSchema = new Schema<IPortfolioDocument>(
    {
        generalInfo: {
            email: String,
            emailSubject: String,
            emailBody: String,
            oldPortfolio: String,
            upworkProfile: String,
            developerTitle: String,
            firstName: String,
            fullName: String,
        },
        socialLinks: [SocialLinkSchema],
        myStack: {
            frontend: [StackItemSchema],
            backend: [StackItemSchema],
            database: [StackItemSchema],
            tools: [StackItemSchema],
        },
        myExperience: [ExperienceSchema],
        projects: [ProjectSchema],
        bannerStats: {
            yearsExperience: String,
            completedProjects: String,
            hoursWorked: String,
            availableStatus: String,
        },
        aboutMe: {
            headline: String,
            bio1: String,
            bio2: String,
        },
        certificates: [CertificateSchema],
        inquiries: [InquirySchema],
    },
    { timestamps: true },
);

// ── Singleton model (safe for Next.js hot-reload) ─────────────────────────────

const PortfolioModel: Model<IPortfolioDocument> =
    mongoose.models.Portfolio ||
    mongoose.model<IPortfolioDocument>('Portfolio', PortfolioSchema);

export default PortfolioModel;
