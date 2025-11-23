"use client";

import React from "react";
import styles from "./PageContainer.module.scss";
import Breadcrumbs from "./Breadcrumbs";

type Props = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <main className={styles.container}>
      <Breadcrumbs />
      {children}
    </main>
  );
}