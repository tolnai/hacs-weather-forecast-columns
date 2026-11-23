/*
 * Author        : Gábor Tolnai
 * Github        : https://github.com/tolnai/hacs-weather-forecast-columns
 * Description   : Weather forecast columns card (like Időkép app)
 */
import { LitElement, html, nothing, type PropertyValues, type TemplateResult, type CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HassEntity } from 'home-assistant-js-websocket';

import styles from './styles';
import { actionHandler } from './ha-action-handler-directive';
import type { ActionHandlerEvent, ForecastEvent, ForecastItem, HomeAssistant, WeatherCardConfig } from './types';
import { columnLayout, forecastModeOf, hasAction, tempColor, TEMP_SIZE } from './utils';
import { weatherIcon } from './icons';
import { DEV, CARD_TAG, EDITOR_TAG } from './const';
import './editor';
import { version } from '../package.json';

// eslint-disable-next-line no-console
console.info(
  `%c Weather Forecast Columns${DEV ? ' DEV' : ''} \n%c Version v${version}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts the card into the UI card picker dialog
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: CARD_TAG,
  name: `Weather Forecast Columns${DEV ? ' DEV' : ''}`,
  preview: false,
  description: 'Weather Forecast Columns Card for Home Assistant (like Időkép app)',
  documentationURL: 'https://github.com/tolnai/hacs-weather-forecast-columns',
});

@customElement(CARD_TAG)
export class WeatherForecastColumnsCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: WeatherCardConfig;
  @state() private _forecast: ForecastItem[] = [];
  @state() private error?: TemplateResult;
  @state() private _forecastError?: string;

  private _unsubForecast?: Promise<() => Promise<void>>;
  private _subscriptionKey?: string;

  static styles: CSSResultGroup = styles;

  static getConfigElement() {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig() {
    return {};
  }

  public setConfig(config?: WeatherCardConfig) {
    if (!config) {
      throw this.createError('Invalid configuration.');
    }
    if (!config.entity) {
      throw this.createError('You need to define a weather entity.');
    }
    this.config = config;
  }

  public getCardSize() {
    return 3;
  }

  public connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) {
      this._subscribeForecast();
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeForecast();
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has('hass') || changedProps.has('config')) {
      this._subscribeForecast();
    }
  }

  // The forecast comes from a websocket subscription (same as the built-in weather card): it works for
  // non-admin users too, and Home Assistant pushes every forecast update. Resubscribes when the entity or
  // the forecast type changes; the websocket library resubscribes by itself after a reconnect.
  private _subscribeForecast() {
    if (!this.hass || !this.config || !this.isConnected) {
      return;
    }
    const entityId = this.config.entity;
    const forecastType = forecastModeOf(this.config);
    const key = `${entityId}|${forecastType}`;
    if (this._subscriptionKey === key) {
      return;
    }
    // Wait until the entity exists, a subscription to a missing entity fails.
    if (!this.hass.states[entityId]) {
      return;
    }
    this._unsubscribeForecast();
    this._subscriptionKey = key;
    this._forecast = [];
    this._forecastError = undefined;
    const unsub = this.hass.connection.subscribeMessage<ForecastEvent>(
      (event) => {
        this._forecast = event.forecast ?? [];
      },
      { type: 'weather/subscribe_forecast', entity_id: entityId, forecast_type: forecastType },
    );
    this._unsubForecast = unsub;
    unsub.catch((err: unknown) => {
      if (this._unsubForecast !== unsub) {
        return;
      }
      this._unsubForecast = undefined;
      this._forecastError = (err as { message?: string } | undefined)?.message ?? 'Forecast not available';
    });
  }

  private _unsubscribeForecast() {
    const unsub = this._unsubForecast;
    this._unsubForecast = undefined;
    this._subscriptionKey = undefined;
    unsub?.then((fn) => fn()).catch(() => undefined);
  }

  private createError(message: string): Error {
    const error = new Error(message);
    const errorCard = document.createElement('hui-error-card') as HTMLElement & {
      setConfig?: (config: Record<string, unknown>) => void;
    };
    errorCard.setConfig?.({ type: 'error', error, origConfig: this.config });
    this.error = html`${errorCard}`;
    return error;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    // Let Home Assistant execute the action: supports every action type (perform-action, confirmation, ...).
    this.dispatchEvent(
      new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: {
          config: {
            entity: this.config.entity,
            tap_action: this.config.tap_action ?? { action: 'more-info' },
            hold_action: this.config.hold_action,
            double_tap_action: this.config.double_tap_action,
          },
          action: ev.detail.action,
        },
      }),
    );
  }

  private _renderName(stateObj?: HassEntity) {
    if (this.config.hideName) {
      return nothing;
    }
    const name = this.config.name || stateObj?.attributes.friendly_name;
    return html`<p class="name">${name ?? html`&nbsp;`}</p>`;
  }

  // Renders the same column structure as the real forecast (same heights), so the card
  // takes its final size immediately and does not jump when the forecast arrives.
  private _renderPlaceholder(stateObj?: HassEntity, message?: string) {
    const { daily, fullHeight } = columnLayout(this.config);
    const count = this.config.numberOfDaysHours || (daily ? 7 : 12);

    return html`
      ${this._renderName(stateObj)}
      <div class="forecast-columns loading">
        ${message ? html`<div class="message">${message}</div>` : nothing}
        ${Array.from(
          { length: count },
          () => html`
            <div class="day">
              <div class="date_day">&nbsp;</div>
              <div class="date_dow">&nbsp;</div>
              <div class="icon"></div>
              <div class="temperature" style="height: ${fullHeight}px;"></div>
            </div>
          `,
        )}
      </div>
    `;
  }

  private _renderWeatherForecast() {
    const stateObj = this.hass?.states[this.config.entity];
    if (!stateObj || this._forecast.length === 0) {
      const message = this.hass && !stateObj ? `Entity not available: ${this.config.entity}` : this._forecastError;
      return this._renderPlaceholder(stateObj, message);
    }

    const { daily, temperatureAreaHeight, boxSize, fullHeight } = columnLayout(this.config);
    const forecast = this.config.numberOfDaysHours
      ? this._forecast.slice(0, this.config.numberOfDaysHours)
      : this._forecast;

    const allTemps = forecast.flatMap((item) => (daily ? [item.temperature, item.templow ?? 0] : [item.temperature]));
    const maxTemp = Math.max(...allTemps);
    const minTemp = Math.min(...allTemps);
    const range = maxTemp - minTemp || 1;
    const language = this.hass.locale.language;

    return html`
      ${this._renderName(stateObj)}
      <div class="forecast-columns">
        ${forecast.map((item) => {
          const date = new Date(item.datetime);
          const maxPos = ((maxTemp - item.temperature) / range) * temperatureAreaHeight;
          const minPos = ((maxTemp - (item.templow ?? 0)) / range) * temperatureAreaHeight + boxSize;
          const weekend = daily && [6, 0].includes(date.getDay());
          const dateText = daily ? date.toLocaleDateString(language, { day: 'numeric' }) : date.getHours();
          return html`
            <div class="day ${weekend ? 'weekend' : ''}">
              <div class="date_day">${dateText}</div>
              <div class="date_dow">${date.toLocaleDateString(language, { weekday: 'short' })}</div>
              <div class="icon">
                <img
                  src=${weatherIcon(item.condition, this.config.iconPack)}
                  alt=${item.condition ?? ''}
                  width=${TEMP_SIZE + 5}
                  height=${TEMP_SIZE + 5}
                />
              </div>
              <div class="temperature" style="height: ${fullHeight}px;">
                <div class="bubble ${daily ? 'max' : 'hourly'}" style="top: ${maxPos}px;">
                  <div
                    class="shape"
                    style=${daily ? '' : `background: rgba(${tempColor(item.temperature)}, 0.5);`}
                  ></div>
                  <span>${item.temperature}</span>
                </div>
                ${
                  daily
                    ? html`
                        <div class="bubble min" style="top: ${minPos}px;">
                          <div class="shape"></div>
                          <span>${item.templow}</span>
                        </div>
                      `
                    : nothing
                }
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult {
    if (this.error) {
      return this.error;
    }

    return html`
      <ha-card>
        <div
          class="main ${this.config.hideMargin ? '' : 'main-padding'}"
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            hasHold: hasAction(this.config.hold_action),
            hasDoubleClick: hasAction(this.config.double_tap_action),
          })}
        >
          ${this._renderWeatherForecast()}
        </div>
      </ha-card>
    `;
  }
}
