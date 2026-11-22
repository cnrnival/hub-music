/**
 * Hub Music - LRC Parser
 * Parser para letras sincronizadas (formato LRC)
 * Parser for synced lyrics (LRC format)
 *
 * @languages pt-BR / en-US
 */

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface ParsedLRC {
  lines: LyricLine[];
  metadata: {
    title?: string;
    artist?: string;
    album?: string;
    by?: string;
    offset?: number; // milliseconds
  };
}

/**
 * Parse LRC format lyrics
 * Supports: [mm:ss.xx], [mm:ss], [mm:ss.xxx], multiple timestamps per line
 */
export function parseLRC(lrcText: string): ParsedLRC {
  const lines = lrcText.split('\n');
  const result: ParsedLRC = {
    lines: [],
    metadata: {},
  };

  // Metadata regex: [ti:Title], [ar:Artist], [al:Album], [by:Editor], [offset:1000]
  const metaRegex = /^\[(ti|ar|al|by|offset):([^\]]*)\]/;

  // Timestamp regex: [mm:ss.xx], [mm:ss], [mm:ss.xxx]
  // Can have multiple timestamps: [00:12.34][00:15.67]Text
  const timestampRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for metadata
    const metaMatch = trimmed.match(metaRegex);
    if (metaMatch) {
      const key = metaMatch[1];
      const value = metaMatch[2].trim();
      switch (key) {
        case 'ti':
          result.metadata.title = value;
          break;
        case 'ar':
          result.metadata.artist = value;
          break;
        case 'al':
          result.metadata.album = value;
          break;
        case 'by':
          result.metadata.by = value;
          break;
        case 'offset':
          result.metadata.offset = parseInt(value, 10) || 0;
          break;
      }
      continue;
    }

    // Extract all timestamps from line
    const timestamps: number[] = [];
    let match;
    let text = trimmed;

    while ((match = timestampRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      timestamps.push(totalSeconds);
    }

    // Remove timestamps from text
    text = text.replace(timestampRegex, '').trim();

    if (text && timestamps.length > 0) {
      // Create a line for each timestamp (for multiple timestamps per line)
      for (const time of timestamps) {
        result.lines.push({ time, text });
      }
    } else if (text) {
      // Line without timestamp (e.g., translation, metadata not caught above)
      result.lines.push({ time: -1, text });
    }
  }

  // Sort by time
  result.lines.sort((a, b) => a.time - b.time);

  // Apply offset if present
  if (result.metadata.offset) {
    const offsetSeconds = result.metadata.offset / 1000;
    result.lines.forEach((line) => {
      if (line.time >= 0) {
        line.time += offsetSeconds;
      }
    });
  }

  return result;
}

/**
 * Get current lyric line index based on playback position
 */
export function getCurrentLyricIndex(lines: LyricLine[], currentTime: number): number {
  let index = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= currentTime) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}

/**
 * Get lyrics around current position (for display)
 */
export function getVisibleLyrics(
  lines: LyricLine[],
  currentTime: number,
  before = 3,
  after = 5
): Array<LyricLine & { isCurrent: boolean }> {
  const currentIndex = getCurrentLyricIndex(lines, currentTime);
  const start = Math.max(0, currentIndex - before);
  const end = Math.min(lines.length, currentIndex + after + 1);

  return lines.slice(start, end).map((line, i) => ({
    ...line,
    isCurrent: start + i === currentIndex,
  }));
}

/**
 * Convert seconds to LRC timestamp format [mm:ss.xx]
 */
export function secondsToLRCTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centis = Math.floor((seconds % 1) * 100);
  return `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}]`;
}

/**
 * Generate LRC from parsed lines (for editing)
 */
export function generateLRC(parsed: ParsedLRC): string {
  const metaLines: string[] = [];
  if (parsed.metadata.title) metaLines.push(`[ti:${parsed.metadata.title}]`);
  if (parsed.metadata.artist) metaLines.push(`[ar:${parsed.metadata.artist}]`);
  if (parsed.metadata.album) metaLines.push(`[al:${parsed.metadata.album}]`);
  if (parsed.metadata.by) metaLines.push(`[by:${parsed.metadata.by}]`);
  if (parsed.metadata.offset) metaLines.push(`[offset:${parsed.metadata.offset}]`);

  // Group lines by text (multiple timestamps for same text)
  const grouped = new Map<string, number[]>();
  for (const line of parsed.lines) {
    if (line.time >= 0) {
      const existing = grouped.get(line.text) || [];
      existing.push(line.time);
      grouped.set(line.text, existing);
    }
  }

  const lyricLines = Array.from(grouped.entries())
    .sort((a, b) => a[1][0] - b[1][0])
    .map(([text, times]) => {
      const timestamps = times.map(secondsToLRCTime).join('');
      return `${timestamps}${text}`;
    });

  return [...metaLines, '', ...lyricLines].join('\n');
}

/**
 * Fetch and parse LRC from LRCLIB API response
 */
export function parseLRCLIBResponse(data: any): ParsedLRC | null {
  if (!data) return null;

  // LRCLIB returns syncedLyrics as plain text LRC
  const lrcText = data.syncedLyrics || data.lyrics || '';
  if (!lrcText) return null;

  return parseLRC(lrcText);
}

/**
 * Simple format for non-synced lyrics (plain text)
 */
export function parsePlainLyrics(text: string): ParsedLRC {
  const lines = text.split('\n').filter((l) => l.trim());
  return {
    lines: lines.map((line, i) => ({ time: i * 4, text: line.trim() })), // Rough estimate: 4s per line
    metadata: {},
  };
}