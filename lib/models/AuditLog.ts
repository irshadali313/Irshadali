import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuditLogDocument extends Document {
    adminId?: mongoose.Types.ObjectId;
    event: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, string>;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>({
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', index: true },
    event: { type: String, required: true, index: true },
    success: { type: Boolean, required: true },
    ipAddress: String,
    userAgent: String,
    metadata: { type: Map, of: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

const AuditLog: Model<IAuditLogDocument> = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
export default AuditLog;