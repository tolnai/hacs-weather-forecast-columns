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
    font-weight: 300;
  }
  .forecast-columns {
    display: flex;
    overflow-x: auto;
    flex-grow: 1;
  }
  .loading {
    opacity: 0.5;
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
  .date_dow {
    border-bottom: 2px solid rgba(128, 128, 128, 0.3);
  }
  .icon {
    width: 35px;
    height: 35px;
    margin: 5px auto;
    border-radius: 50%;
    background: var(--shadow-color);
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
