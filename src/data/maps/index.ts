import type { MapDef } from '../schema';
import { forest } from './forest';
import { maze } from './maze';
import { village } from './village';

export const MAPS: Record<string, MapDef> = { village, forest, maze };
