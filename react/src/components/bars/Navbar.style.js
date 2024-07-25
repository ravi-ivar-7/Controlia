import styled from "styled-components";
export const  Header = styled.header`
  background: #333;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;

  .input-nav {
    margin-left: 5rem !important;
    width: 25rem;
    color: #000;
    &::placeholder {
      color: #aaa;
    }
  }

  .icon-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  img {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
  }

  @media (max-width: 920px) {
    .input-nav {
      display: none;
    }
  }
`;
export const ThreeStateButton = styled.div`
  .tri-state-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px; /* Adjust gap for smaller spacing */
  }
  
  .tri-state-toggle-button {
    // padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #f0f0f0;
    cursor: pointer;
    font-size: 14px; /* Smaller font size */
    transition: background 0.3s, color 0.3s;
  }
  
  .tri-state-toggle-button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;