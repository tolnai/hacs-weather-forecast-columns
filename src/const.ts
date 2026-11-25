// Set by the rollup configs: true in the dev build (yarn start), false in the release build (yarn build).
// Undefined elsewhere (tests, typecheck), which counts as false.
declare const __WEATHER_COLUMNS_DEV__: boolean | undefined;

// DEV registers the card under a "-dev" tag, so it can run next to the released version.
export const DEV = typeof __WEATHER_COLUMNS_DEV__ !== 'undefined' && __WEATHER_COLUMNS_DEV__;

export const CARD_TAG = `hacs-weather-forecast-columns${DEV ? '-dev' : ''}`;
export const EDITOR_TAG = `hacs-weather-forecast-columns-editor${DEV ? '-dev' : ''}`;
