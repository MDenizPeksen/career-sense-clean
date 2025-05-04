import styled from "styled-components";

export const StyledButton = styled("button")<{ color?: string }>`
  background: ${(p) => {
    if (p.color === "indigo") return "#6366f1";
    if (p.color === "purple") return "#8b5cf6";
    if (p.color === "gradient") return "linear-gradient(90deg, #6366f1, #8b5cf6)";
    return p.color || "#2e186a";
  }};
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 13px 0;
  cursor: pointer;
  margin-top: 0.625rem;
  max-width: 180px;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover,
  &:active,
  &:focus {
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;
