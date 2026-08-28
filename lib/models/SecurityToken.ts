import mongoose, { Document, Model, Schema } from 'mongoose';

export type SecurityTokenType = 'password-reset' | 'mfa-challenge';

export interface ISecurityTokenDocument extends Document {
    adminId: mongoose.Types.ObjectId;
    tokenHash: string;
    type: SecurityTokenType;
    expiresAt: Date;
    usedAt?: Date;
}

const SecurityTokenSchema = new Schema<ISecurityTokenDocument>({
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    type: { type: String, enum: ['password-reset', 'mfa-challenge'], required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: Date,
});
SecurityTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SecurityToken: Model<ISecurityTokenDocument> = mongoose.models.SecurityToken || mongoose.model<ISecurityTokenDocument>('SecurityToken', SecurityTokenSchema);
export default SecurityToken;