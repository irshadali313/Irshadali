import mongoose, { Document, Model, Schema } from 'mongoose';

export type AdminRole = 'superadmin' | 'admin' | 'developer';

export interface IAdminDocument extends Document {
    email: string;
    passwordHash: string;
    role: AdminRole;
    isActive: boolean;
    mfaEnabled: boolean;
    mfaSecretEncrypted?: string;
    failedLoginCount: number;
    lockedUntil?: Date;
    passwordChangedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['superadmin', 'admin', 'developer'], default: 'admin' },
    isActive: { type: Boolean, default: true, index: true },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecretEncrypted: { type: String, select: false },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: Date,
    passwordChangedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Admin: Model<IAdminDocument> = mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);
export default Admin;
