"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface NavigationClientProps {
  href: string;
  isActive: boolean;
  className: string;
  children: ReactNode;
  title?: string;
}

const NavigationClient = ({
  href,
  //   isActive,
  className,
  children,
  title,
}: NavigationClientProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
};

export default NavigationClient;
