import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  ha-card {
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
  }
  .main {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: auto;
    width: 100%;
    overflow-x: scroll;
    scrollbar-width: none;
    cursor: pointer;
  }
  .main-padding {
    padding: 6px 16px;
  }
  .name {
    margin: 4px 0;
    line-height: 20px;
    font-weight: 300;
  }
  .forecast-columns {
    display: flex;
    overflow-x: auto;
    flex-grow: 1;
  }
  .forecast-columns.loading {
    position: relative;
  }
  .loading .day {
    opacity: 0.5;
  }
  .message {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    text-align: center;
    color: var(--warning-color);
    z-index: 1;
  }
  .day {
    flex-grow: 1;
    min-width: 40px;
    text-align: center;
    border-left: 1px solid rgba(128, 128, 128, 0.3);
    border-right: 1px solid rgba(128, 128, 128, 0.3);
  }
  .weekend .date_day,
  .weekend .date_dow {
    color: var(--red-color);
  }
  .date_day,
  .date_dow {
    line-height: 20px;
  }
  .date_dow {
    border-bottom: 2px solid rgba(128, 128, 128, 0.3);
  }
  .icon {
    width: 35px;
    height: 35px;
    margin: 5px auto;
    border-radius: 50%;
    background: var(--weather-forecast-columns-icon-background, #ddd);
  }
  .icon img {
    display: block;
  }
  .temperature {
    position: relative;
    width: 40px;
    margin: 0 auto;
  }
  .bubble {
    position: absolute;
    left: 5px;
    width: 30px;
    height: 30px;
    font-size: 20px;
    line-height: 30px;
  }
  .bubble span {
    position: relative;
    z-index: 1;
  }
  .shape {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .max .shape {
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    background: var(--accent-color);
    opacity: 0.6;
  }
  .min .shape {
    border-radius: 0 50% 50% 50%;
    transform: rotate(45deg);
    background: var(--primary-color);
    opacity: 0.6;
  }
  .hourly .shape {
    border-radius: 50%;
  }
`;
