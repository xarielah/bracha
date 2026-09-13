import type { ImageMetadata } from 'astro';
import emblemRoshHashana from '../assets/holidays/rosh-hashana/emblem.png';
import bgRoshHashana from '../assets/holidays/rosh-hashana/bg.jpg';
import emblemYomKippur from '../assets/holidays/yom-kippur/emblem.png';
import bgYomKippur from '../assets/holidays/yom-kippur/bg.jpg';
import emblemSukkot from '../assets/holidays/sukkot/emblem.png';
import bgSukkot from '../assets/holidays/sukkot/bg.jpg';
import emblemSimchatTorah from '../assets/holidays/simchat-torah/emblem.png';
import bgSimchatTorah from '../assets/holidays/simchat-torah/bg.jpg';
import emblemHanukkah from '../assets/holidays/hanukkah/emblem.png';
import bgHanukkah from '../assets/holidays/hanukkah/bg.jpg';
import emblemTuBishvat from '../assets/holidays/tu-bishvat/emblem.png';
import bgTuBishvat from '../assets/holidays/tu-bishvat/bg.jpg';
import emblemPurim from '../assets/holidays/purim/emblem.png';
import bgPurim from '../assets/holidays/purim/bg.jpg';
import emblemPesach from '../assets/holidays/pesach/emblem.png';
import bgPesach from '../assets/holidays/pesach/bg.jpg';
import emblemYomHaatzmaut from '../assets/holidays/yom-haatzmaut/emblem.png';
import bgYomHaatzmaut from '../assets/holidays/yom-haatzmaut/bg.jpg';
import emblemLagBaomer from '../assets/holidays/lag-baomer/emblem.png';
import bgLagBaomer from '../assets/holidays/lag-baomer/bg.jpg';
import emblemShavuot from '../assets/holidays/shavuot/emblem.png';
import bgShavuot from '../assets/holidays/shavuot/bg.jpg';

export type HolidayArt = {
  emblem: ImageMetadata;
  bg: ImageMetadata;
};

export const holidayArt: Record<string, HolidayArt> = {
  'rosh-hashana': { emblem: emblemRoshHashana, bg: bgRoshHashana },
  'yom-kippur': { emblem: emblemYomKippur, bg: bgYomKippur },
  'sukkot': { emblem: emblemSukkot, bg: bgSukkot },
  'simchat-torah': { emblem: emblemSimchatTorah, bg: bgSimchatTorah },
  'hanukkah': { emblem: emblemHanukkah, bg: bgHanukkah },
  'tu-bishvat': { emblem: emblemTuBishvat, bg: bgTuBishvat },
  'purim': { emblem: emblemPurim, bg: bgPurim },
  'pesach': { emblem: emblemPesach, bg: bgPesach },
  'yom-haatzmaut': { emblem: emblemYomHaatzmaut, bg: bgYomHaatzmaut },
  'lag-baomer': { emblem: emblemLagBaomer, bg: bgLagBaomer },
  'shavuot': { emblem: emblemShavuot, bg: bgShavuot },
};

export function getHolidayArt(slug: string): HolidayArt | undefined {
  return holidayArt[slug];
}
