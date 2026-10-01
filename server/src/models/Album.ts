import mongoose, { Schema, Document } from 'mongoose';

export interface IAlbumDocument extends Document {
  title: string;
  artistId: string;
  artistName: string;
  coverImage: string;
  releaseDate: string;
  genre: string;
  tracks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema = new Schema<IAlbumDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    artistId: { type: String, required: true, index: true },
    artistName: { type: String, required: true, index: true },
    coverImage: { type: String, default: '' },
    releaseDate: { type: String, default: '' },
    genre: { type: String, default: '' },
    tracks: [{ type: String }]
  },
  { timestamps: true }
);

AlbumSchema.index({ title: 'text', artistName: 'text' });

export const AlbumModel = mongoose.models.Album || mongoose.model<IAlbumDocument>('Album', AlbumSchema);
