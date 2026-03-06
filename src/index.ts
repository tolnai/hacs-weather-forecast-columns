import { LitElement, html, type TemplateResult, type CSSResultGroup, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type HomeAssistant,
  hasAction,
  type ActionHandlerEvent,
  handleAction,
  type ActionConfig,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers
import { type HassEntity } from 'home-assistant-js-websocket';

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

import styles from './styles';
import editStyles from './styles-edit';
import { actionHandler } from './ha-action-handler-directive';
import { version } from '../package.json';

// Use this if you want both the dev and prod versions installed in the same instance - they will have different names
// For local development use true, but change it to true whenever building a new release
const DEV = false;

// Change these values to your card's name, description and URL
const cardId = 'hacs-weather-forecast-columns';
const cardName = 'Weather Forecast Columns';
const cardDescription = 'Weather Forecast Columns Card for Home Assistant (like Időkép app)';
const cardUrl = 'https://github.com/tolnai/hacs-weather-forecast-columns';

type MyCardConfig = {
  entity: string;
  name?: string;
  hideName?: boolean;
  numberOfDays?: number;
  iconPack?: number;
  height?: number;
  hideMargin?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};

// Extend the Window interface to include loadCardHelpers
declare global {
  interface Window {
    loadCardHelpers?: () => Promise<any>;
  }
}

const loadHaForm = async () => {
  if (customElements.get('ha-form') && customElements.get('hui-entities-card-editor')) return;
  if (window.loadCardHelpers) {
    const helpers = await window.loadCardHelpers();
    if (!helpers) return;
    const card = await helpers.createCardElement({ type: 'entities', entities: [] });
    if (!card) return;
    card.constructor.getConfigElement();
  }
};

console.info(
  `%c ${cardName}${DEV ? ' DEV' : ''} \n%c Version v${version}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: `${cardId}${DEV ? '-dev' : ''}`,
  name: `${cardName}${DEV ? ' DEV' : ''}`,
  preview: false, // Optional - defaults to false
  description: cardDescription,
  documentationURL: cardUrl,
});

@customElement(`${cardId}${DEV ? '-dev' : ''}`)
export class HacsWeatherForecastColumnsCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: MyCardConfig;
  @state() private _forecast: any[] = [];
  @state() private error?: TemplateResult;

  constructor() {
    super();
  }

  // Connecting the editor to the card
  static getConfigElement() {
    return document.createElement(`${cardId}-editor${DEV ? '-dev' : ''}`);
  }

  // This is the default config when creating a new card
  static getStubConfig() {
    return {};
  }

  // This is called when the config is changed/loaded
  public setConfig(config?: MyCardConfig) {
    if (!config) {
      throw this.createError('Invalid configuration.');
    }
    if (!config.entity) {
      throw this.createError('You need to define a weather entity.');
    }
    this.config = config;
  }

  // Initial (non-grid) size
  public getCardSize() {
    return 3;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    const oldConfig = changedProps.get('config') as MyCardConfig | undefined;
    if (changedProps.has('config') && this.config?.entity !== oldConfig?.entity) {
      this._fetchForecast();
    } else if (changedProps.has('hass') && this.hass && this._forecast.length === 0) {
      this._fetchForecast();
    }
  }

  private async _fetchForecast() {
    if (!this.hass || !this.config || !this.config.entity) return;

    try {
      const forecastServiceResponse = await this.hass.connection.sendMessagePromise<any>({
        type: "execute_script",
        sequence: [{
          "service": "weather.get_forecasts",
          "data": {
            entity_id: this.config.entity,
            type: 'daily',
          },
          "target": { "entity_id": this.config.entity },
          "response_variable": "return_response",
        },
        {
          "stop": "done",
          "response_variable": "return_response",
        }]
      });
      const forecast = forecastServiceResponse?.response?.[this.config.entity]?.forecast || [];
      if (forecast.length > 0) {
        this._forecast = forecast;
      }
    } catch (e) {
      // Ignore error for production
    }
  }

  // Action handling logic (handles fallback from entity action to global card default action)
  private handleAction(event: ActionHandlerEvent): void {
    if (this.hass && this.config && event.detail.action) {
      event.preventDefault();
      event.stopPropagation();
      handleAction(
        this,
        this.hass,
        this.config.tap_action ? this.config : { ...this.config, tap_action: { action: 'more-info' } as ActionConfig },
        event.detail.action,
      );
    }
  }

  private createError(errorString: string): Error {
    const error = new Error(errorString);
    const errorCard = document.createElement('hui-error-card') as any;
    (errorCard as any).setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });
    this.error = html`${errorCard}`;
    return error;
  }

  _fireMoreInfoEvent(entityId: string) {
    this._fireHassEvent('hass-more-info', { entityId });
  }

  _fireHassEvent(type: string, detail?: any) {
    const e = new CustomEvent(type, {
      detail: detail === null || detail === undefined ? {} : detail,
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    this.dispatchEvent(e);
    return e;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }

  /*_renderButton(entityConfig: MyEntityConfig, stateObj: HassEntity) {
    return html`
      <span
        @click=${() => this._callService(entityConfig, stateObj)}
      >
        Click me
      </p>
    `;
  }*/
  
  _renderName(stateObj: HassEntity) {
    if (this.config.hideName) {
      return '';
    }
    //const nameSize = `${this.config.sampleNumber ?? 14}px`;
    // variables can be passed to the CSS style code like below
    // style="--fontSize:${nameSize};"
    return html`
      <p
        class="name"
        
        @action=${(e: ActionHandlerEvent) => {
          this.handleAction(e);
        }}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action || this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action || this.config.double_tap_action),
        })}
      >
        ${this.config.name || stateObj.attributes.friendly_name}
      </p>
    `;
  }
  
  _renderWeatherForecast() {
    const stateObj = this.hass.states[this.config.entity];
    if (!stateObj) {
      return html``;
    }

    // Fallback to forecast attribute if service call hasn't populated data yet or failed
    const forecastData = this._forecast.length > 0 
      ? this._forecast 
      : (stateObj.attributes.forecast || []);

    const allTemps = forecastData.reduce((acc: number[], day: any) => acc.concat([day.temperature, day.templow]), []);
    const maxTemp = Math.max(...allTemps);
    const minTemp = Math.min(...allTemps);
    const range = maxTemp - minTemp || 1;
    const temperatureAreaHeight = this.config.height || 100;
    const tempSize = 30;
    const boxSize = tempSize * Math.sqrt(2);
    const fullHeight = temperatureAreaHeight + 2 * boxSize;

    const forecastDays = this.config.numberOfDays ? forecastData.slice(0, this.config.numberOfDays) : forecastData;

    return html`
      ${this._renderName(stateObj)}
      <div class="forecast-columns" style="display: flex; overflow-x: auto; flex-grow: 1;">
        ${forecastDays.map((day: any) => {
          const maxPos = ((maxTemp - day.temperature) / range) * temperatureAreaHeight;
          const minPos = ((maxTemp - day.templow) / range) * temperatureAreaHeight + boxSize;
          return html`
          <div class="day" style="text-align: center; min-width: ${tempSize + 10}px; border-left: 1px solid rgba(128, 128, 128, 0.3); border-right: 1px solid rgba(128, 128, 128, 0.3); flex-grow: 1; width: auto;">
            <div class="date_day">${new Date(day.datetime).toLocaleDateString(this.hass.locale.language, { day: 'numeric' })}</div>
            <div class="date_dow" style="border-bottom: 2px solid rgba(128, 128, 128, 0.3);">${new Date(day.datetime).toLocaleDateString(this.hass.locale.language, { weekday: 'short' })}</div>
            <div class="icon" style="width: ${tempSize + 5}px; height: ${tempSize + 5}px; margin: 5px auto; border-radius: ${(tempSize + 5) / 2}px; background: var(--shadow-color);">
              <img src="${this._getWeatherIcon(day.condition)}" alt="${day.condition}" width="${tempSize + 5}" height="${tempSize + 5}" />
            </div>
            <div class="temperature" style="height: ${fullHeight}px; position: relative; text-align: center; text-align: center; width: ${tempSize + 10}px; margin: 0 auto;">
              <div class="max" style="font-size: ${tempSize - 10}px; line-height: ${tempSize}px; width: ${tempSize}px; height: ${tempSize}px; position: absolute; top: ${maxPos}px; left: 5px;">
                <div style="
                  position: absolute; top:0; left:0; right:0; bottom:0;
                  border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
                  background: var(--accent-color); opacity: 0.6; z-index: 0;
                "></div>
                <span style="position: relative; z-index: 1;">${day.temperature}</span>
              </div>
              <div class="min" style="font-size: ${tempSize - 10}px; line-height: ${tempSize}px; width: ${tempSize}px; height: ${tempSize}px; position: absolute; top: ${minPos}px; left: 5px;">
                <div style="
                  position: absolute; top:0; left:0; right:0; bottom:0;
                  border-radius: 0 50% 50% 50%; transform: rotate(45deg);
                  background: var(--primary-color); opacity: 0.6; z-index: 0;
                "></div>
                <span style="position: relative; z-index: 1;">${day.templow}</span>
              </div>
            </div>
          </div>
        `})}
      </div>
    `;
  }

  _getWeatherIcon(condition: string) {
    const weatherIcons = [{
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
    }];
    const icons = weatherIcons[(this.config.iconPack || 1) - 1];

    return icons[condition] || '';
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
          @action=${(e: ActionHandlerEvent) => {
            this.handleAction(e);
          }}
          .actionHandler=${actionHandler({
            hasHold: hasAction(this.config.hold_action || this.config.hold_action),
            hasDoubleClick: hasAction(this.config.double_tap_action || this.config.double_tap_action),
          })}
        >
          ${!this.config.entity ? html` You need to define an entity ` : this._renderWeatherForecast()}
        </div>
      </ha-card>
    `;
  }
}

// The below is the code for the editor UI of the card, which is a lit component as well.

const actions: string[] = ['navigate', 'url', 'perform-action', 'none'];

@customElement(`${cardId}-editor${DEV ? '-dev' : ''}`)
export class HacsWeatherForecastColumnsCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: MyCardConfig;
  @state() private _selectedTab = 'configuration';

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    loadHaForm();
  }

  setConfig(config: MyCardConfig) {
    this._config = config;
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return editStyles;
  }

  _computeLabel(e) {
    return e.label || e.name;
  }

  _valuesChanged(ev: CustomEvent) {
    this._config = ev.detail.value;
    this._publishConfig();
  }

  _publishConfig() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _handleSwitchTab(ev: CustomEvent) {
    this._selectedTab = ev.detail.name;
  }

  // This should include everything from the main MyCardConfig type
  // Selectors can be found here: https://www.home-assistant.io/docs/blueprint/selectors/
  _renderConfigurationEditor() {
    return html`
      <div class="box">
        <h3>Entity</h3>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            { name: 'entity', label: 'Entity', selector: { entity: { domain: 'weather' } }, required: true },
            { name: 'name', label: 'Name', selector: { text: {} } },
            { name: 'hideName', label: 'Hide name?', selector: { boolean: {} } },
          ]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valuesChanged}
        ></ha-form>
      </div>
      <div class="box">
        <h3>Layout</h3>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            {
              name: 'numberOfDays', label: 'Number of days (default: all)', selector: { number: {} },
            },
            {
              name: 'iconPack',
              label: 'Icon pack',
              selector: {
                select: {
                  options: [
                    { label: 'Brighter', value: 1 },
                    { label: 'Darker', value: 2 },
                  ],
                  mode: 'dropdown',
                },
              },
              required: true,
            },
            {
              name: 'height', label: 'Height (px, default: 100)', selector: { number: {} },
            },
            { name: 'hideMargin', label: 'Hide margin?', selector: { boolean: {} } },
          ]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valuesChanged}
        ></ha-form>
      </div>
      <div class="box">
        <h3>Actions (override defaults)</h3>
        <p class="intro">Individual actions of this entity (override any default actions).</p>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            { name: 'tap_action', label: 'Tap action', selector: { ui_action: { actions } } },
            { name: 'hold_action', label: 'Hold action', selector: { ui_action: { actions } } },
            { name: 'double_tap_action', label: 'Double tap action', selector: { ui_action: { actions } } },
          ]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valuesChanged}
        ></ha-form>
      </div>
    `;
  }

  _renderContent() {
    if (this._selectedTab === 'configuration') {
      return this._renderConfigurationEditor();
    }
    return html``;
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="toolbar">
          <sl-tab-group @sl-tab-show=${this._handleSwitchTab}>
            <sl-tab slot="nav" panel="configuration" .active=${this._selectedTab === 'configuration'}>Configuration</sl-tab>
          </sl-tab-group>
        </div>
        <div id="editor">${this._renderContent()}</div>
      </div>
    `;
  }
}
