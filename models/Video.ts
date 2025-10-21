import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  poster: string;
  duration: number;
  year: number;
  genres: string[];
  languages: string[];
  categories: string[];
  cast: string[];
  director?: string;
  rating?: number;
  isTrending: boolean;
  isFeatured: boolean;
  quality: string[];
  universe?: string;
  audioTracks?: { language: string; name: string }[];
  subtitles?: { language: string; url: string }[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },
    poster: { type: String, required: true },
    duration: { type: Number, required: true },
    year: { type: Number, required: true, index: true },
    genres: { type: [String], required: true, index: true },
    languages: { type: [String], required: true, index: true },
    categories: { type: [String], required: true, index: true },
    cast: { type: [String], default: [] },
    director: { type: String },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    isTrending: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    quality: { type: [String], default: ['1080p'] },
    universe: { type: String },
    audioTracks: [{ language: String, name: String }],
    subtitles: [{ language: String, url: String }],
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Text index for search
VideoSchema.index({ title: 'text', description: 'text', cast: 'text' });

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
