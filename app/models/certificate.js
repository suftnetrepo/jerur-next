import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  certificateUrl: String,
  issuedAt: { type: Date, default: Date.now },
});

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
export default Certificate;
