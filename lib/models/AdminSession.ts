import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdminSessionDocument extends Document {
    adminId: mongoose.Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    lastUsedAt: Date;
    userAgent?: string;
    ipAddress?: string;
}

const AdminSessionSchema = new Schema<IAdminSessionDocument>({
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String,
});

AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AdminSession: Model<IAdminSessionDocument> = mongoose.models.AdminSession || mongoose.model<IAdminSessionDocument>('AdminSession', AdminSessionSchema);
export default AdminSession;