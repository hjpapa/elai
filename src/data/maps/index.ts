import type { MapDef } from '../schema';
import { cave } from './cave';
import { cavedeep } from './cavedeep';
import { desert } from './desert';
import { desertmaze } from './desertmaze';
import { harbor } from './harbor';
import { lighthouse } from './lighthouse';
import { lab } from './lab';
import { labdeep } from './labdeep';
import { observatory } from './observatory';
import { starmaze } from './starmaze';
import { workshop } from './workshop';
import { bookmaze } from './bookmaze';
import { forest } from './forest';
import { maze } from './maze';
import { village } from './village';

export const MAPS: Record<string, MapDef> = { village, forest, maze, cave, cavedeep, desert, desertmaze, harbor, lighthouse, lab, labdeep, observatory, starmaze, workshop, bookmaze };
