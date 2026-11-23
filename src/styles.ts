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
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .main-padding {
    padding: 6px 16px 6px 16px;
  }
  .loading {
    opacity: 0.5;
  }
  .name {
    font-weight: 300;
    font-size: var(--fontSize);
    line-height: var(--fontSize);
    cursor: pointer;
  }
`;
