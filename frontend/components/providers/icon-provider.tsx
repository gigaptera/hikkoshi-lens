"use client";

import { IconContext } from "@phosphor-icons/react";

interface IconProviderProps {
  children: React.ReactNode;
}

export function IconProvider({ children }: IconProviderProps) {
  return (
    <IconContext.Provider
      value={{
        color: "currentColor",
        size: "1em",
        weight: "light",
        mirrored: false,
      }}
    >
      {children}
    </IconContext.Provider>
  );
}
