/**
 * Hub Music - Audio Service
 * Serviço de áudio: metadados, waveform, conversão MP3, hash de conteúdo
 * Audio service: metadata, waveform generation, MP3 conversion, content hash
 * 
 * @languages pt-BR / en-US
 */

import { spawn } from 'child_process';
import { createHash } from 'crypto';
import { promisify } from 'util';
import { Readable } from 'stream';

export interface AudioMetadata {
  durationSeconds: number;
  format: string;
  sampleRate: number;
  channels: number;
  bitrate: number;
}

export interface WaveformData {
  peaks: number[];
  duration: number;
}

/**
 * Get audio metadata using ffprobe
 */
export async function getAudioMetadata(buffer: Buffer): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'a:0',
      '-show_entries', 'stream=duration,sample_rate,channels,bit_rate,codec_name',
      '-of', 'json',
      '-i', 'pipe:0'
    ]);

    let stdout = '';
    let stderr = '';

    ffprobe.stdout.on('data', (data) => { stdout += data.toString(); });
    ffprobe.stderr.on('data', (data) => { stderr += data.toString(); });

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed: ${stderr}`));
        return;
      }

      try {
        const data = JSON.parse(stdout);
        const stream = data.streams?.[0];
        if (!stream) {
          reject(new Error('No audio stream found'));
          return;
        }

        resolve({
          durationSeconds: Math.round(parseFloat(stream.duration)),
          format: stream.codec_name || 'mp3',
          sampleRate: parseInt(stream.sample_rate),
          channels: parseInt(stream.channels),
          bitrate: parseInt(stream.bit_rate) || 0
        });
      } catch (err) {
        reject(new Error(`Failed to parse ffprobe output: ${err}`));
      }
    });

    // Write buffer to stdin
    ffprobe.stdin.write(buffer);
    ffprobe.stdin.end();
  });
}

/**
 * Generate waveform peaks using FFmpeg's astats filter
 * Returns array of peak values (0-1) for visualization
 */
export async function generateWaveform(buffer: Buffer, samples = 1000): Promise<number[]> {
  return new Promise((resolve, reject) => {
    // Use ffmpeg to get RMS values at intervals
    const duration = 30; // We'll get peaks for the full track
    const interval = duration / samples;

    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-af', `astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-`,
      '-f', 'null', '-'
    ]);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => { stderr += data.toString(); });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        // Fallback: generate synthetic waveform
        resolve(generateSyntheticWaveform(samples));
        return;
      }

      try {
        const peaks = parseWaveformOutput(stderr, samples);
        if (peaks.length > 0) {
          resolve(normalizePeaks(peaks));
        } else {
          resolve(generateSyntheticWaveform(samples));
        }
      } catch (err) {
        resolve(generateSyntheticWaveform(samples));
      }
    });

    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();
  });
}

/**
 * Generate waveform using ffmpeg's showwavespic for visual waveform
 * Returns base64 encoded PNG (alternative approach)
 */
export async function generateWaveformImage(buffer: Buffer, width = 1000, height = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-filter_complex', `showwavespic=s=${width}x${height}:colors=#FF4081`,
      '-frames:v', '1',
      '-f', 'image2pipe',
      '-vcodec', 'png',
      '-'
    ]);

    const chunks: Buffer[] = [];
    let stderr = '';

    ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk));
    ffmpeg.stderr.on('data', (data) => { stderr += data.toString(); });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg failed: ${stderr}`));
        return;
      }
      const imageBuffer = Buffer.concat(chunks);
      resolve(`data:image/png;base64,${imageBuffer.toString('base64')}`);
    });

    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();
  });
}

/**
 * Generate waveform peaks using a more efficient method with ffmpeg
 * Uses the 'astats' filter to get RMS levels at regular intervals
 */
export async function generateWaveformPeaks(buffer: Buffer, numPeaks = 1000): Promise<number[]> {
  return new Promise((resolve, reject) => {
    // Use a more efficient approach: get audio data at specific timestamps
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-af', `asetnsamples=n=1024,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.Peak_level:file=-`,
      '-f', 'null', '-'
    ]);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => { stderr += data.toString(); });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        resolve(generateSyntheticWaveform(numPeaks));
        return;
      }

      const peaks = parsePeakOutput(stderr, numPeaks);
      resolve(normalizePeaks(peaks));
    });

    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();
  });
}

/**
 * Parse astats output to extract peak levels
 */
function parsePeakOutput(output: string, targetSamples: number): number[] {
  const lines = output.split('\n');
  const peaks: number[] = [];

  for (const line of lines) {
    if (line.includes('lavfi.astats.Overall.Peak_level')) {
      const match = line.match(/Peak_level=([-\d.]+)/);
      if (match) {
        const peak = Math.abs(parseFloat(match[1]));
        peaks.push(peak);
      }
    }
  }

  // Resample to target number of peaks
  return resampleArray(peaks, targetSamples);
}

/**
 * Parse old waveform output format
 */
function parseWaveformOutput(output: string, targetSamples: number): number[] {
  const lines = output.split('\n');
  const peaks: number[] = [];

  for (const line of lines) {
    if (line.includes('RMS_level')) {
      const match = line.match(/RMS_level=([-\d.]+)/);
      if (match) {
        const rms = Math.abs(parseFloat(match[1]));
        peaks.push(rms);
      }
    }
  }

  return resampleArray(peaks, targetSamples);
}

/**
 * Resample array to target length using linear interpolation
 */
function resampleArray(source: number[], targetLength: number): number[] {
  if (source.length === 0) return generateSyntheticWaveform(targetLength);
  if (source.length === targetLength) return source;

  const result: number[] = [];
  const ratio = (source.length - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, source.length - 1);
    const weight = srcIndex - srcIndexFloor;

    const value = source[srcIndexFloor] * (1 - weight) + source[srcIndexCeil] * weight;
    result.push(value);
  }

  return result;
}

/**
 * Normalize peaks to 0-1 range
 */
function normalizePeaks(peaks: number[]): number[] {
  if (peaks.length === 0) return generateSyntheticWaveform(1000);

  const max = Math.max(...peaks);
  if (max === 0) return peaks.map(() => 0);

  return peaks.map(p => Math.min(1, Math.max(0, p / max)));
}

/**
 * Generate a synthetic waveform for fallback/testing
 */
function generateSyntheticWaveform(samples: number): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < samples; i++) {
    // Create a somewhat realistic looking waveform
    const base = Math.sin(i * 0.1) * 0.3;
    const variation = Math.sin(i * 0.5) * 0.2;
    const noise = (Math.random() - 0.5) * 0.1;
    const envelope = Math.sin(i / samples * Math.PI) * 0.5 + 0.5;
    peaks.push(Math.max(0, Math.min(1, (base + variation + noise) * envelope)));
  }
  return peaks;
}

/**
 * Convert audio to a standard format (mp3) for consistent playback
 */
export async function convertToMp3(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-codec:a', 'libmp3lame',
      '-b:a', '192k',
      '-f', 'mp3',
      '-'
    ]);

    const chunks: Buffer[] = [];
    let stderr = '';

    ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk));
    ffmpeg.stderr.on('data', (data) => { stderr += data.toString(); });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg conversion failed: ${stderr}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });

    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();
  });
}

/**
 * Generate a unique hash for audio content deduplication
 */
export function generateAudioHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex').substring(0, 16);
}

/**
 * Get audio duration in seconds (quick method)
 */
export async function getDuration(buffer: Buffer): Promise<number> {
  const metadata = await getAudioMetadata(buffer);
  return metadata.durationSeconds;
}