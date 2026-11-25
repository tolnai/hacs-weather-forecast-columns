import type { ActionConfig, ForecastItem, ForecastMode, WeatherCardConfig } from './types';

export const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const hasAction = (config?: ActionConfig): boolean => config !== undefined && config.action !== 'none';

export const forecastModeOf = (config: WeatherCardConfig): ForecastMode =>
  config.forecastMode === 'hourly' ? 'hourly' : 'daily';

export const DEFAULT_TEMPERATURE_HEIGHT = 100;
// Size of one temperature bubble in px.
export const TEMP_SIZE = 30;

export interface ColumnLayout {
  daily: boolean;
  // Height of the area the bubbles move in (px).
  temperatureAreaHeight: number;
  // Size of the rotated (drop shaped) bubble box of the daily layout.
  boxSize: number;
  // Full height of the temperature part of a column, bubbles included.
  fullHeight: number;
}

export const columnLayout = (config: WeatherCardConfig): ColumnLayout => {
  const daily = forecastModeOf(config) === 'daily';
  const temperatureAreaHeight = config.height && config.height >= 20 ? config.height : DEFAULT_TEMPERATURE_HEIGHT;
  const boxSize = TEMP_SIZE * Math.sqrt(2);
  // Both layouts keep the same free space (boxSize - TEMP_SIZE, ~12px) under the lowest bubble, so the
  // horizontal scrollbar does not cover it.
  const fullHeight = temperatureAreaHeight + (daily ? 2 * boxSize : boxSize);
  return { daily, temperatureAreaHeight, boxSize, fullHeight };
};

// Colors of the hourly temperature bubbles: Home Assistant theme colors (with their default values as
// fallback), dense at low temperatures so that winter days are not all the same color.
const TEMP_COLORS: [max: number, color: string, darkText?: boolean][] = [
  [-10, 'var(--deep-purple-color, #673ab7)'],
  [-5, 'var(--indigo-color, #3f51b5)'],
  [0, 'var(--blue-color, #2196f3)'],
  [5, 'var(--teal-color, #009688)'],
  [10, 'var(--green-color, #4caf50)'],
  [15, 'var(--light-green-color, #8bc34a)', true],
  [20, 'var(--lime-color, #cddc39)', true],
  [25, 'var(--amber-color, #ffc107)', true],
  [30, 'var(--orange-color, #ff9800)'],
  [35, 'var(--deep-orange-color, #ff5722)'],
];

export const tempColor = (temp: number): { color: string; darkText: boolean } => {
  const rounded = Math.round(temp);
  const match = TEMP_COLORS.find(([max]) => rounded <= max);
  return match
    ? { color: match[1], darkText: match[2] ?? false }
    : { color: 'var(--red-color, #f44336)', darkText: false };
};

// Highest temperature and the temperature range of the shown forecast. Missing values (e.g. no templow) are skipped.
export const temperatureRange = (forecast: ForecastItem[], daily: boolean): { maxTemp: number; range: number } => {
  const temps = forecast
    .flatMap((item) => (daily ? [item.temperature, item.templow] : [item.temperature]))
    .filter(isNumber);
  if (temps.length === 0) {
    return { maxTemp: 0, range: 1 };
  }
  const maxTemp = Math.max(...temps);
  return { maxTemp, range: maxTemp - Math.min(...temps) || 1 };
};

// Fixed heights (px) of the card parts, see styles.ts.
const PADDING = 12;
const NAME_HEIGHT = 28;
const DATE_ROWS_HEIGHT = 20 + 20 + 2;
const ICON_HEIGHT = TEMP_SIZE + 5 + 10;

// Card height in px, used for masonry (getCardSize) and sections (getGridOptions) layouts.
export const estimateHeight = (config: WeatherCardConfig): number =>
  (config.hideMargin ? 0 : PADDING) +
  (config.hideName ? 0 : NAME_HEIGHT) +
  DATE_ROWS_HEIGHT +
  ICON_HEIGHT +
  columnLayout(config).fullHeight;
