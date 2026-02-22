import React from "react";
import * as Icons from "lucide-react";
// @ts-ignore
import { icons } from "lucide-react";

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 24,
  className,
  strokeWidth = 2,
}) => {
  // Check if name is a URL (image)
  if (name.startsWith("http") || name.startsWith("/")) {
    return (
      <img
        src={name}
        alt="Icon"
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Get icon from explicit 'icons' export or fallback to 'Icons' namespace
  const source = icons || (Icons as any).icons || Icons;
  const LucideIcon = source[name as keyof typeof source];

  if (!LucideIcon) {
      // Fallback to HelpCircle
      const HelpCircle = source["HelpCircle"] || Icons.HelpCircle;
      if (HelpCircle) {
        return (
            <HelpCircle
                size={size}
                className={className}
                strokeWidth={strokeWidth}
            />
        );
      }
      return null;
  }

  return (
    <LucideIcon size={size} className={className} strokeWidth={strokeWidth} />
  );
};

export default DynamicIcon;
