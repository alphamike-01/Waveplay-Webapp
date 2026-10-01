import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { SEED_ARTISTS, SEED_ALBUMS, SEED_TRACKS, SEED_PLAYLISTS } from '../data/seedData.js';
import { ArtistModel } from '../models/Artist.js';
import { AlbumModel } from '../models/Album.js';
import { TrackModel } from '../models/Track.js';
import { PlaylistModel } from '../models/Playlist.js';
import { UserModel } from '../models/User.js';
import { UserLibraryModel } from '../models/UserLibrary.js';

dotenv.config();

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/waveplay';
  console.log(`Connecting to ${uri}...`);

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB. Starting database seed...');

    // Clear existing collections
    await Promise.all([
      ArtistModel.deleteMany({}),
      AlbumModel.deleteMany({}),
      TrackModel.deleteMany({}),
      PlaylistModel.deleteMany({}),
      UserModel.deleteMany({}),
      UserLibraryModel.deleteMany({})
    ]);

    // Seed User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('WavePlay123!', salt);
    const demoUser = await UserModel.create({
      name: 'Wave Explorer',
      email: 'demo@waveplay.io',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      role: 'user'
    });

    // Seed Artists
    const artists = await ArtistModel.insertMany(SEED_ARTISTS);
    console.log(`Seeded ${artists.length} artists`);

    // Seed Albums
    const albums = await AlbumModel.insertMany(SEED_ALBUMS);
    console.log(`Seeded ${albums.length} albums`);

    // Seed Tracks
    const tracks = await TrackModel.insertMany(SEED_TRACKS);
    console.log(`Seeded ${tracks.length} tracks`);

    // Seed Playlists
    const playlists = await PlaylistModel.insertMany(SEED_PLAYLISTS);
    console.log(`Seeded ${playlists.length} playlists`);

    // Seed Library
    await UserLibraryModel.create({
      userId: demoUser._id.toString(),
      likedTracks: [SEED_TRACKS[0].id, SEED_TRACKS[5].id, SEED_TRACKS[10].id, SEED_TRACKS[30].id, SEED_TRACKS[45].id],
      savedAlbums: [SEED_ALBUMS[0].id, SEED_ALBUMS[2].id, SEED_ALBUMS[12].id],
      followedArtists: [SEED_ARTISTS[0].id, SEED_ARTISTS[1].id, SEED_ARTISTS[6].id],
      playlists: [playlists[0]._id.toString(), playlists[1]._id.toString()]
    });

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
