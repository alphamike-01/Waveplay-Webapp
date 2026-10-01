import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLibraryDocument extends Document {
  userId: string;
  likedTracks: string[];
  savedAlbums: string[];
  followedArtists: string[];
  playlists: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserLibrarySchema = new Schema<IUserLibraryDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    likedTracks: [{ type: String }],
    savedAlbums: [{ type: String }],
    followedArtists: [{ type: String }],
    playlists: [{ type: String }]
  },
  { timestamps: true }
);

export const UserLibraryModel =
  mongoose.models.UserLibrary || mongoose.model<IUserLibraryDocument>('UserLibrary', UserLibrarySchema);
