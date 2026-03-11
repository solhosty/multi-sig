"use client";

import { Toaster } from "sonner";

export const AppToaster = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        className: "!border !border-[hsl(var(--border))] !bg-[hsl(var(--card))] !text-[hsl(var(--foreground))]"
      }}
    />
  );
};
