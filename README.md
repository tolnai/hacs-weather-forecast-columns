# Weather Forecast Columns Card for Home Assistant

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](#installation)
[![Total downloads](https://img.shields.io/github/downloads/tolnai/hacs-weather-forecast-columns/total)](https://github.com/tolnai/hacs-weather-forecast-columns/releases)
[![Current version](https://img.shields.io/github/v/release/tolnai/hacs-weather-forecast-columns)](https://github.com/tolnai/hacs-weather-forecast-columns/releases/latest)

This is a custom card for Home Assistant, installed from the Marketplace (or HACS on older versions), which shows the weather forecast in columns, in the style of the Időkép app. Each column is a day (or an hour) with its weather icon, and the temperatures are drawn at a height matching their value, so the trend is visible at a glance.

- Daily forecast: high and low temperature drops
- Hourly forecast: temperature bubbles colored by temperature
- Weekends highlighted in the daily forecast
- Live updates: the forecast is pushed by Home Assistant, the card does not poll
- Works with any weather entity that provides a daily or hourly forecast

The card has a visual editor, but all configuration options are detailed below.

Check out my other work at [https://github.com/tolnai/home_assistant_cookbook](https://github.com/tolnai/home_assistant_cookbook).

## Options

| Name              | Type    | Default       | Description                                                       |
| ----------------- | ------- | ------------- | ----------------------------------------------------------------- |
| type              | string  | **Required**  | `custom:hacs-weather-forecast-columns`                            |
| entity            | entity  | **Required**  | Weather entity                                                    |
| name              | string  | entity's name | Show this name instead of the entity's name                       |
| hideName          | boolean | `false`       | Hides the name                                                    |
| forecastMode      | string  | `daily`       | Forecast type: `daily` or `hourly`                                |
| numberOfDaysHours | number  | all           | Number of days/hours to show                                      |
| iconPack          | number  | `1`           | Icon pack: `1` (brighter) or `2` (darker)                         |
| iconBackground    | string  | `#444`     | Background color of the icon circle (any CSS color, `transparent` hides it) |
| height            | number  | `100`         | Height of the temperature area in px (minimum 20)                 |
| hideMargin        | boolean | `false`       | Removes the padding around the card content                       |
| tap_action        | action  | `more-info`   | Tap action                                                        |
| hold_action       | action  |               | Hold action                                                       |
| double_tap_action | action  |               | Double tap action                                                 |

Actions use the usual Home Assistant action configuration. By default, tapping the card opens the more info dialog of the weather entity.

### Theming

The weather icons are shown on a dark grey circle. Its color can be set with the `iconBackground` option, or for all cards with the `--weather-forecast-columns-icon-background` CSS variable in a theme.

## Installation

Requires Home Assistant 2024.11 or newer.

### Home Assistant 2026.11 and newer: Marketplace

- Go to Settings > Marketplace and select **Add from link** in the upper-right corner
- Enter `tolnai/hacs-weather-forecast-columns` (or the full URL of this repo) and select Add. If asked, connect GitHub and pick type **Dashboards**
- Open "Weather Forecast Columns Card" in the list and select Install
- After reloading the page, the card will be available in the card picker

### Older Home Assistant versions: HACS

- Open [HACS](https://hacs.xyz) in Home Assistant, click the "..." menu, Custom repositories
- Copy the URL of this repo (<https://github.com/tolnai/hacs-weather-forecast-columns>), pick type "Dashboard" and press Add
- Search for "weather forecast columns", pick it from the list, press Download
- After reloading the page, the card will be available in the card picker

## Examples

### Daily forecast

```yaml
type: custom:hacs-weather-forecast-columns
entity: weather.home
```

### Hourly forecast

```yaml
type: custom:hacs-weather-forecast-columns
entity: weather.home
forecastMode: hourly
numberOfDaysHours: 12
```

### Full example

```yaml
type: custom:hacs-weather-forecast-columns
entity: weather.home
name: Budapest
hideName: false
forecastMode: daily
numberOfDaysHours: 7
iconPack: 2
iconBackground: '#b0b0b0'
height: 120
hideMargin: false
tap_action:
  action: navigate
  navigation_path: /weather
hold_action:
  action: more-info
```

## Development

```sh
yarn install
yarn start   # dev build to ../www with the -dev card tag, served on port 5001
yarn build   # release build to dist/
yarn lint && yarn typecheck && yarn test
```

The dev build registers the card as `custom:hacs-weather-forecast-columns-dev`, so it can run next to the released version.

Releases are created by GitHub Actions when a version tag is pushed, see [.github/workflows/release.yml](.github/workflows/release.yml).

## Credits

- Weather icons from [weather-icons](https://github.com/basmilius/weather-icons) by [basmilius](https://github.com/basmilius)
- Inspired by the [Időkép](https://www.idokep.hu) app

<a href="https://www.buymeacoffee.com/tolnai" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
