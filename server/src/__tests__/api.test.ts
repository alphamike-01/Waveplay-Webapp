import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { connectDB } from '../config/db.js';

beforeAll(async () => {
  await connectDB();
});

describe('WavePlay API Test Suite', () => {
  it('GET /api/health returns healthy system status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.catalog.tracks).toBeGreaterThanOrEqual(50);
  });

  it('GET /api/tracks returns paginated track list', async () => {
    const res = await request(app).get('/api/tracks?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tracks.length).toBe(10);
    expect(res.body.tracks[0]).toHaveProperty('audioUrl');
    expect(res.body.tracks[0]).toHaveProperty('title');
  });

  it('GET /api/search finds matching tracks and artists', async () => {
    const res = await request(app).get('/api/search?q=Aetheria');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.artists.length).toBeGreaterThan(0);
    expect(res.body.artists[0].name).toBe('Aetheria');
  });

  it('POST /api/auth/demo-login returns authenticated user and JWT token', async () => {
    const res = await request(app).post('/api/auth/demo-login');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('demo@waveplay.io');
  });

  it('GET /api/recommendations returns recommended tracks and playlists', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.recommendedTracks.length).toBeGreaterThan(0);
    expect(res.body.featuredPlaylists.length).toBeGreaterThan(0);
  });

  it('POST /api/audio/validate-url validates well-formed audio URLs', async () => {
    const res = await request(app)
      .post('/api/audio/validate-url')
      .send({ url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' });
    expect(res.status).toBe(200);
    expect(res.body.playable).toBe(true);
  });
});
