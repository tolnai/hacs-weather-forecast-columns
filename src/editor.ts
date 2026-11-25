import { LitElement, html, type CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import editStyles from './styles-edit';
import type { HomeAssistant, WeatherCardConfig } from './types';
import { EDITOR_TAG } from './const';

// ha-form is lazy-loaded by Home Assistant. Creating an entities card and asking for its editor
// forces HA to load it, so this editor can use it.
const loadHaForm = async () => {
  if (customElements.get('ha-form') && customElements.get('hui-entities-card-editor')) return;
  const helpers = await window.loadCardHelpers?.();
  const card = await helpers?.createCardElement({ type: 'entities', entities: [] });
  await (card?.constructor as { getConfigElement?: () => Promise<unknown> } | undefined)?.getConfigElement?.();
};

interface SchemaItem {
  name: string;
  label?: string;
}

const actions: string[] = ['more-info', 'navigate', 'url', 'perform-action', 'none'];

@customElement(EDITOR_TAG)
export class WeatherForecastColumnsCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: WeatherCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaForm();
  }

  setConfig(config: WeatherCardConfig) {
    this._config = config;
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return editStyles;
  }

  _computeLabel(item: SchemaItem) {
    return item.label || item.name;
  }

  _valuesChanged(ev: CustomEvent<{ value: WeatherCardConfig }>) {
    this._config = ev.detail.value;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Selectors: https://www.home-assistant.io/docs/blueprint/selectors/
  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

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
              name: 'forecastMode',
              label: 'Forecast type (default: daily)',
              selector: {
                select: {
                  options: [
                    { label: 'Daily', value: 'daily' },
                    { label: 'Hourly', value: 'hourly' },
                  ],
                  mode: 'dropdown',
                },
              },
            },
            {
              name: 'numberOfDaysHours',
              label: 'Number of days/hours (default: all)',
              selector: { number: { min: 1, mode: 'box' } },
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
            },
            {
              name: 'iconBackground',
              label: 'Icon background color (CSS color, e.g. #c8c8c8 or transparent)',
              selector: { text: {} },
            },
            {
              name: 'height',
              label: 'Temperature area height (px, default: 100)',
              selector: { number: { min: 20, mode: 'box' } },
            },
            { name: 'hideMargin', label: 'Hide margin?', selector: { boolean: {} } },
          ]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valuesChanged}
        ></ha-form>
      </div>
      <div class="box">
        <h3>Actions</h3>
        <p class="intro">Default tap action: show more info of the weather entity.</p>
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
}
