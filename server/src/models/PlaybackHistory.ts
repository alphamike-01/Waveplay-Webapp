import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaybackHistoryDocument extends Document {
  userId: string;
  trackId: string;
  track: any;
  playedAt: Date;
  position: number;
  completed: boolean;
}

const PlaybackHistorySchema = new Schema<IPlaybackHistoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    trackId: { type: String, required: true, index: true },
    track: { type: Schema.Types.Mixed },
    playedAt: { type: Date, default: Date.now, index: true },
    position: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const PlaybackHistoryModel =
  mongoose.models.PlaybackHistory ||
  mongoose.model<IPlaybackHistoryDocument>('PlaybackHistory', PlaybackHistorySchema);
