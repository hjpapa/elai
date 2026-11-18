import { checkMaze, SIZE } from './mazeRules';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// CRC-4 (x^4 + x + 1) over the 61 data bits.
function checksum(bits: string): number {
  let crc = 0;
  for (const bit of bits) {
    const feedback = (crc >> 3) ^ Number(bit);
    crc = ((crc << 1) & 15) ^ (feedback ? 3 : 0);
  }
  return crc;
}

export function encodeMaze(rows: readonly string[]): string | null {
  if (!checkMaze(rows).connected) return null;
  const cells = rows.join('');
  const index = (c: string) => cells.indexOf(c).toString(2).padStart(6, '0');
  const data = Array.from(cells, c => c === '#' ? '1' : '0').join('') + index('S') + index('G');
  const bits = data + checksum(data).toString(2).padStart(4, '0');
  const code = bits.match(/.{5}/g)!.map(chunk => ALPHABET[parseInt(chunk, 2)]).join('');
  return code.slice(0, 4) + '-' + code.slice(4, 8) + '-' + code.slice(8);
}

export function decodeMaze(input: string): string[] | null {
  const code = input.replace(/[\s-]/g, '').toUpperCase();
  if (code.length !== 13 || [...code].some(c => !ALPHABET.includes(c))) return null;
  const bits = [...code].map(c => ALPHABET.indexOf(c).toString(2).padStart(5, '0')).join('');
  if (checksum(bits.slice(0, 61)) !== parseInt(bits.slice(61), 2)) return null;
  const start = parseInt(bits.slice(49, 55), 2);
  const goal = parseInt(bits.slice(55, 61), 2);
  if (start === goal || bits[start] !== '0' || bits[goal] !== '0' || Math.max(start, goal) >= 49) return null;
  const cells = Array.from(bits.slice(0, 49), (bit, i) => i === start ? 'S' : i === goal ? 'G' : bit === '1' ? '#' : '.');
  const rows = Array.from({ length: SIZE }, (_, y) => cells.slice(y * SIZE, (y + 1) * SIZE).join(''));
  return checkMaze(rows).connected ? rows : null;
}
