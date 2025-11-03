"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <main className={`container mx-auto px-4 py-10`}>
      {children}
    </main>
  );
}