import { LitElement, html, type TemplateResult, type CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type HomeAssistant,
  hasAction,
  type ActionHandlerEvent,
  handleAction,
  type ActionConfig,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers
import { type HassEntity } from 'home-assistant-js-websocket';

import styles from './styles';
import editStyles from './styles-edit';
import { actionHandler } from './ha-action-handler-directive';
import { version } from '../package.json';

// Use this if you want both the dev and prod versions installed in the same instance - they will have different names
// For local development use true, but change it to true whenever building a new release
const DEV = false;

// Change these values to your card's name, description and URL
const cardId = 'hacs-weather-forecast-columns';
const cardName = 'HACS Weather Forecast Columns';
const cardDescription = 'HACS Weather Forecast Columns Card for Home Assistant (like Időkép app)';
const cardUrl = 'https://github.com/tolnai/hacs-weather-forecast-columns';

type MyCardConfig = {
  entity: string;
  name?: string;
  numberOfDays?: number;
  scrollable?: boolean;
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
  @state() private error?: TemplateResult;

  private counter = 0;

  constructor() {
    super();
  }

  // Connecting the editor to the card
  static getConfigElement() {
    return document.createElement(`${cardId}-editor${DEV ? '-dev' : ''}`);
  }

  // This is the default config when creating a new card
  static getStubConfig() {
    return { entities: [] };
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
    return html`
      <div>
        ${this._renderName(stateObj)}
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
        <div class="main">
          ${!this.config.entity ? html` You need to define an entity ` : this._renderWeatherForecast()}
        </div>
        Counter: ${this.counter}
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
        <h3>Layout</h3>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            {
              name: 'sampleText', label: 'Gimme some text', selector: { text: {} },
            },
            {
              name: 'sampleEnum',
              label: 'Choose one',
              selector: {
                select: {
                  options: [
                    { label: 'One', value: 'one' },
                    { label: 'Two', value: 'two' },
                    { label: 'Three', value: 'three' },
                  ],
                  mode: 'dropdown',
                },
              },
              required: true,
            },
            { name: 'sampleFlag', label: 'Do something?', selector: { boolean: {} } },
          ]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valuesChanged}
        ></ha-form>
      </div>
      <div class="box">
        <h3>Default visual settings</h3>
        <p class="intro">These settings can be set globally here, or individually in the entity editor.</p>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            {
              name: 'sampleNumber', label: 'A number, maybe a font size?', selector: { number: {} },
            },
            {
              name: 'sampleIcon', label: 'Pick an icon', selector: { icon: {} },
            },
          ]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valuesChanged}
        ></ha-form>
      </div>
      <div class="box">
        <h3>Entity</h3>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            { name: 'entity', label: 'Entity', selector: { entity: { domain: 'cover' } }, required: true },
            { name: 'name', label: 'Name', selector: { text: {} } },
            { name: 'sampleFlag', label: 'Do something?', selector: { boolean: {} } },
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
