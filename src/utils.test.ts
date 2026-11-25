import { describe, expect, it } from 'vitest';
import { columnLayout, estimateHeight, forecastModeOf, hasAction, temperatureRange, tempColor } from './utils';
import type { ForecastItem } from './types';

const item = (temperature: number, templow?: number): ForecastItem => ({
  datetime: '2026-11-23T12:00:00Z',
  temperature,
  templow,
});

describe('forecastModeOf', () => {
  it('defaults to daily', () => {
    expect(forecastModeOf({ entity: 'weather.x' })).toBe('daily');
    expect(forecastModeOf({ entity: 'weather.x', forecastMode: 'hourly' })).toBe('hourly');
  });
});

describe('columnLayout', () => {
  it('uses the default height for missing or too small values', () => {
    expect(columnLayout({ entity: 'weather.x' }).temperatureAreaHeight).toBe(100);
    expect(columnLayout({ entity: 'weather.x', height: 5 }).temperatureAreaHeight).toBe(100);
    expect(columnLayout({ entity: 'weather.x', height: 150 }).temperatureAreaHeight).toBe(150);
  });
  it('reserves room for two bubbles in daily and one in hourly mode', () => {
    expect(columnLayout({ entity: 'weather.x' }).fullHeight).toBeCloseTo(100 + 2 * 30 * Math.SQRT2);
    expect(columnLayout({ entity: 'weather.x', forecastMode: 'hourly' }).fullHeight).toBeCloseTo(100 + 30 * Math.SQRT2);
  });
});

describe('temperatureRange', () => {
  it('uses temperature and templow in daily mode', () => {
    expect(temperatureRange([item(10, 2), item(15, 5)], true)).toEqual({ maxTemp: 15, range: 13 });
  });
  it('ignores templow in hourly mode', () => {
    expect(temperatureRange([item(10, 2), item(15, 5)], false)).toEqual({ maxTemp: 15, range: 5 });
  });
  it('skips missing templow values', () => {
    expect(temperatureRange([item(10), item(15)], true)).toEqual({ maxTemp: 15, range: 5 });
  });
  it('never returns a zero range', () => {
    expect(temperatureRange([item(10)], false).range).toBe(1);
    expect(temperatureRange([], true)).toEqual({ maxTemp: 0, range: 1 });
  });
});

describe('estimateHeight', () => {
  it('adds up the fixed parts', () => {
    const hourly = { entity: 'weather.x', forecastMode: 'hourly' as const };
    expect(estimateHeight(hourly)).toBeCloseTo(12 + 28 + 42 + 45 + 100 + 30 * Math.SQRT2);
    expect(estimateHeight({ ...hourly, hideName: true, hideMargin: true })).toBeCloseTo(
      42 + 45 + 100 + 30 * Math.SQRT2,
    );
  });
});

describe('hasAction', () => {
  it('is false for missing and none actions', () => {
    expect(hasAction(undefined)).toBe(false);
    expect(hasAction({ action: 'none' })).toBe(false);
    expect(hasAction({ action: 'more-info' })).toBe(true);
  });
});

describe('tempColor', () => {
  it('maps temperatures to theme colors', () => {
    expect(tempColor(-15).color).toBe('var(--deep-purple-color, #673ab7)');
    expect(tempColor(-7).color).toBe('var(--indigo-color, #3f51b5)');
    expect(tempColor(0).color).toBe('var(--blue-color, #2196f3)');
    expect(tempColor(3).color).toBe('var(--teal-color, #009688)');
    expect(tempColor(40)).toEqual({ color: 'var(--red-color, #f44336)', darkText: false });
  });
  it('uses the rounded temperature', () => {
    expect(tempColor(0.4).color).toBe('var(--blue-color, #2196f3)');
    expect(tempColor(0.6).color).toBe('var(--teal-color, #009688)');
  });
  it('uses dark text on light colors', () => {
    expect(tempColor(22).darkText).toBe(true);
    expect(tempColor(12).darkText).toBe(true);
    expect(tempColor(7).darkText).toBe(false);
  });
});
