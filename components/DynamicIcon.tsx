import React from "react";
import * as Icons from "lucide-react";

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
  // @ts-ignore - dynamiczny dostęp do biblioteki ikon
  const LucideIcon = Icons[name as keyof typeof Icons];

  if (!LucideIcon) {
    return (
      <Icons.HelpCircle
        size={size}
        className={className}
        strokeWidth={strokeWidth}
      />
    );
  }

  // @ts-ignore
  return (
    <LucideIcon size={size} className={className} strokeWidth={strokeWidth} />
  );
};

export default DynamicIcon;
