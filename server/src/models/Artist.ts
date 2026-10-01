import mongoose, { Schema, Document } from 'mongoose';

export interface IArtistDocument extends Document {
  name: string;
  image: string;
  bio: string;
  genres: string[];
  followers: number;
  monthlyListeners: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArtistSchema = new Schema<IArtistDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    genres: [{ type: String }],
    followers: { type: Number, default: 0 },
    monthlyListeners: { type: Number, default: 0 },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

ArtistSchema.index({ name: 'text', bio: 'text' });

export const ArtistModel = mongoose.models.Artist || mongoose.model<IArtistDocument>('Artist', ArtistSchema);
