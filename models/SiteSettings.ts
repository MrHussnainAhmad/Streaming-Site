import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: '',
    trim: true,
    maxlength: 100
  },
  logo: {
    type: String,
    default: '',
    trim: true
  },
  favicon: {
    type: String,
    default: '',
    trim: true
  },
  enableUserAuth: {
    type: Boolean,
    default: false,
  },
  // Footer Settings
  enableSecondaryFooter: {
    type: Boolean,
    default: false,
  },
  secondaryFooterContent: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000
  },
  // Advertising Settings
  enableAds: {
    type: Boolean,
    default: false,
  },
  adType: {
    type: String,
    enum: ['google', 'custom'],
    default: 'google',
  },
  googleAdSenseId: {
    type: String,
    default: '',
    trim: true,
    maxlength: 50
  },
  customAdImage: {
    type: String,
    default: '',
    trim: true
  },
  customAdLink: {
    type: String,
    default: '',
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Add mongoose options for better handling
  timestamps: false, // We handle updatedAt manually
  versionKey: '__v', // Keep version key for conflict detection
  minimize: false, // Don't remove empty objects
});

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
