import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylistDocument extends Document {
  name: string;
  description: string;
  coverImage: string;
  ownerId: string;
  ownerName: string;
  tracks: any[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema = new Schema<IPlaylistDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    ownerId: { type: String, required: true, index: true },
    ownerName: { type: String, default: 'WavePlay User' },
    tracks: [{ type: Schema.Types.Mixed }],
    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

PlaylistSchema.index({ name: 'text', description: 'text' });

export const PlaylistModel = mongoose.models.Playlist || mongoose.model<IPlaylistDocument>('Playlist', PlaylistSchema);
