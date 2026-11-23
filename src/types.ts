import type { Connection, HassEntities } from 'home-assistant-js-websocket';

// Minimal subset of Home Assistant frontend types used by this card.
// (Replaces the unmaintained custom-card-helpers package.)

export interface HomeAssistant {
  states: HassEntities;
  connection: Connection;
  locale: { language: string };
}

export interface ActionConfig {
  action: string;
  [key: string]: unknown;
}

export type ActionHandlerEvent = CustomEvent<{ action: 'tap' | 'hold' | 'double_tap' }>;

export type ForecastMode = 'daily' | 'hourly';

export interface WeatherCardConfig {
  entity: string;
  name?: string;
  hideName?: boolean;
  forecastMode?: ForecastMode;
  numberOfDaysHours?: number;
  iconPack?: number;
  height?: number;
  hideMargin?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// One item of the weather.get_forecasts / weather/subscribe_forecast response.
export interface ForecastItem {
  datetime: string;
  condition?: string;
  temperature: number;
  templow?: number;
  [key: string]: unknown;
}

// Event of the weather/subscribe_forecast subscription.
export interface ForecastEvent {
  type: ForecastMode;
  forecast: ForecastItem[] | null;
}

// Card picker registry and HA card helpers on window.
declare global {
  interface Window {
    customCards?: {
      type: string;
      name: string;
      description?: string;
      preview?: boolean;
      documentationURL?: string;
    }[];
    loadCardHelpers?: () => Promise<{
      createCardElement(config: Record<string, unknown>): Promise<HTMLElement | undefined>;
    }>;
  }
}
