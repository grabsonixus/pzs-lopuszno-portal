import React from "react";

const SeparatorBlock: React.FC = () => {
  return (
    <div className="w-full relative z-20">
       <div className="w-full overflow-hidden leading-none rotate-180">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[80px]"
        >
          <path
            d="M1200 120L0 16.48V0h1200v120z"
            className="fill-neutral-100"
          ></path>
        </svg>
    </div>
    {/* Decorative line */}
    <div className="h-1.5 w-full bg-gradient-to-r from-school-primary via-school-accent to-school-primary opacity-80 relative z-30"></div>
    </div>
  );
};

export default SeparatorBlock;
