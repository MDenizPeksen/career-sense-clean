import { SvgIconProps } from "../types";

export const SvgIcon = ({ src, width, height }: SvgIconProps) => (
  <img 
    src={`/img/svg/${src}`} 
    alt={src} 
    width={width} 
    height={height}
    onError={(e) => {
      console.error(`Failed to load SVG: ${src}`);
      // Try alternative path if first one fails
      (e.target as HTMLImageElement).src = `/img/svg/${src}`;
    }}
  />
);
