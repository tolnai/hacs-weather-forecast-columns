import type { ActionConfig, WeatherCardConfig } from './types';

export const hasAction = (config?: ActionConfig): boolean => config !== undefined && config.action !== 'none';

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
  const daily = config.forecastMode !== 'hourly';
  const temperatureAreaHeight = config.height && config.height >= 20 ? config.height : DEFAULT_TEMPERATURE_HEIGHT;
  const boxSize = TEMP_SIZE * Math.sqrt(2);
  const fullHeight = daily ? temperatureAreaHeight + 2 * boxSize : temperatureAreaHeight + TEMP_SIZE;
  return { daily, temperatureAreaHeight, boxSize, fullHeight };
};

// Background color (r, g, b) of the hourly temperature bubbles.
export const tempColor = (temp: number): string => {
  if (temp <= -20) return '128, 128, 128'; // grey
  if (temp <= 5) return '0, 0, 255'; // blue
  if (temp <= 15) return '0, 128, 0'; // dark green
  if (temp <= 26) return '255, 255, 0'; // yellow
  if (temp <= 30) return '255, 165, 0'; // orange
  if (temp <= 35) return '255, 0, 0'; // red
  return '139, 0, 0'; // dark red
};
