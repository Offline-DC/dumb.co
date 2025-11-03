import React from "react";

type Props = {
  href: string;
  title: string;
  ariaLabel?: string;
  size?: "big" | "medium" | "small";
  children?: React.ReactNode;
};

export const CTAButton = ({
  href,
  title,
  ariaLabel,
  size = "big",
  children,
}: Props) => {
  return (
    <div className="cta-container">
      <a
        className="cta-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        <div className={`line ${size}`}>{title}</div>
        {children}
      </a>
    </div>
  );
};
