import { describe, it, expect } from 'vitest';
import { parseFileMetadata } from '../storage/localMusicStore.js';
import { formatDuration } from '../components/cards/TrackRow.js';

describe('Local Music & Formatting Tests', () => {
  it('parses file name in "Artist - Title" pattern', () => {
    const file = new File([''], 'Daft Punk - Get Lucky.mp3', { type: 'audio/mpeg' });
    const meta = parseFileMetadata(file);
    expect(meta.artist).toBe('Daft Punk');
    expect(meta.title).toBe('Get Lucky');
  });

  it('parses raw song filename with underscores', () => {
    const file = new File([''], 'midnight_drive_in_tokyo.wav', { type: 'audio/wav' });
    const meta = parseFileMetadata(file);
    expect(meta.artist).toBe('Local Artist');
    expect(meta.title).toBe('midnight drive in tokyo');
  });

  it('correctly formats track duration seconds to mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(360)).toBe('6:00');
    expect(formatDuration(423)).toBe('7:03');
  });
});
