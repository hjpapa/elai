import { CHAPTERS } from '../../data/chapters';
import type { DialogueLine, SaveData } from '../../data/schema';
import { STORIES } from '../../data/story';
import { shouldShowEnding } from './ending';

interface Visit { lines: DialogueLine[]; flags: string[] }

export function storyForVisit(save: SaveData, map: string, demo: boolean, busy: boolean): Visit {
  const empty = {lines: [], flags: []};
  if (demo || busy || shouldShowEnding(save)) return empty;
  if (map === 'village') {
    const cleared = CHAPTERS.filter(c => STORIES[c.id] && save.flags[c.id + '-clear']);
    const latest = cleared.at(-1);
    if (!latest) return empty;
    const key = 'story:' + latest.id + ':clear';
    const flags = cleared.map(c=>'story:' + c.id + ':clear').filter(f=>!save.flags[f]);
    const show = latest.index !== 8 && !save.flags[key];
    return {lines: show ? STORIES[latest.id].clear : [], flags};
  }
  const chapter = CHAPTERS.find(c=>c.entryMap === map && STORIES[c.id]);
  if (!chapter) return empty;
  const key = 'story:' + chapter.id + ':enter';
  if (save.flags[key]) return empty;
  return {lines: save.flags[chapter.id + '-clear'] ? [] : STORIES[chapter.id].enter, flags:[key]};
}
