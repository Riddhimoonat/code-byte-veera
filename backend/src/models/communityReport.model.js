import mongoose from 'mongoose';

const communityReportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Suspicious Activity', 'Poor Lighting', 'Eve Teasing', 'Harassment', 'Crowded', 'Isolated'],
    required: true
  },
  description: String,
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Reports auto-delete after 24 hours to keep data 'LIVE' and fresh
  }
});

const CommunityReport = mongoose.model('CommunityReport', communityReportSchema);
export default CommunityReport;
