import clearNight from './assets/clear-night.svg';
import cloudy from './assets/cloudy.svg';
import cloudy2 from './assets/cloudy2.svg';
import exceptional from './assets/exceptional.svg';
import fog from './assets/fog.svg';
import fog2 from './assets/fog2.svg';
import hail from './assets/hail.svg';
import hail2 from './assets/hail2.svg';
import lightningRainy from './assets/lightning-rainy.svg';
import lightningRainy2 from './assets/lightning-rainy2.svg';
import lightning from './assets/lightning.svg';
import lightning2 from './assets/lightning2.svg';
import partlycloudy from './assets/partlycloudy.svg';
import partlycloudy2 from './assets/partlycloudy2.svg';
import pouring from './assets/pouring.svg';
import pouring2 from './assets/pouring2.svg';
import rainy from './assets/rainy.svg';
import rainy2 from './assets/rainy2.svg';
import snowyRainy from './assets/snowy-rainy.svg';
import snowyRainy2 from './assets/snowy-rainy2.svg';
import snowy from './assets/snowy.svg';
import snowy2 from './assets/snowy2.svg';
import sunny from './assets/sunny.svg';
import windy from './assets/windy.svg';

// Icon packs, indexed by the iconPack config option (1-based).
export const weatherIcons: Record<string, string>[] = [
  {
    'clear-night': clearNight,
    cloudy: cloudy,
    exceptional: exceptional,
    fog: fog,
    hail: hail,
    lightning: lightning,
    'lightning-rainy': lightningRainy,
    partlycloudy: partlycloudy,
    pouring: pouring,
    rainy: rainy,
    snowy: snowy,
    'snowy-rainy': snowyRainy,
    sunny: sunny,
    windy: windy,
    'windy-variant': windy,
  },
  {
    'clear-night': clearNight,
    cloudy: cloudy2,
    exceptional: exceptional,
    fog: fog2,
    hail: hail2,
    lightning: lightning2,
    'lightning-rainy': lightningRainy2,
    partlycloudy: partlycloudy2,
    pouring: pouring2,
    rainy: rainy2,
    snowy: snowy2,
    'snowy-rainy': snowyRainy2,
    sunny: sunny,
    windy: windy,
    'windy-variant': windy,
  },
];

export const weatherIcon = (condition: string | undefined, iconPack = 1): string =>
  (weatherIcons[iconPack - 1] ?? weatherIcons[0])[condition ?? ''] ?? '';
