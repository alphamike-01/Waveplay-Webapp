import mongoose, { Schema, Document } from 'mongoose';

export interface ITrackDocument extends Document {
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number;
  coverImage: string;
  audioUrl: string;
  sourceType: string;
  genre: string;
  releaseDate: string;
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrackDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    artist: { type: String, required: true, trim: true, index: true },
    artistId: { type: String, required: true, index: true },
    album: { type: String, default: '', index: true },
    albumId: { type: String, default: '', index: true },
    duration: { type: Number, required: true, default: 0 },
    coverImage: { type: String, default: '' },
    audioUrl: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['LOCAL', 'REMOTE', 'STREAM', 'UPLOADED'],
      default: 'STREAM'
    },
    genre: { type: String, default: 'Pop', index: true },
    releaseDate: { type: String, default: '' },
    playCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

TrackSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

export const TrackModel = mongoose.models.Track || mongoose.model<ITrackDocument>('Track', TrackSchema);
