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
    expect(columnLayout({ entity: 'weather.x', forecastMode: 'hourly' }).fullHeight).toBe(130);
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
    expect(estimateHeight(hourly)).toBe(12 + 28 + 42 + 45 + 130);
    expect(estimateHeight({ ...hourly, hideName: true, hideMargin: true })).toBe(42 + 45 + 130);
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
  it('maps temperatures to colors', () => {
    expect(tempColor(0)).toBe('0, 0, 255');
    expect(tempColor(20)).toBe('255, 255, 0');
    expect(tempColor(40)).toBe('139, 0, 0');
  });
});
