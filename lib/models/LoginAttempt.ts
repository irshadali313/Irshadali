import mongoose, { Document, Model, Schema } from 'mongoose';

interface ILoginAttemptDocument extends Document {
    key: string;
    count: number;
    expiresAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttemptDocument>({
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
});
LoginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const LoginAttempt: Model<ILoginAttemptDocument> = mongoose.models.LoginAttempt || mongoose.model<ILoginAttemptDocument>('LoginAttempt', LoginAttemptSchema);
export default LoginAttempt;