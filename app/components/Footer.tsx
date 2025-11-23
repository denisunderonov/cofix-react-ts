"use client"
import React from "react";
import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.column}>
            <h3 className={styles.title}>Cofix на Курской</h3>
            <p className={styles.description}>
              Неофициальный сайт кофейни
            </p>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Контакты</h4>
            <a 
              href="https://t.me/denisunderonov" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              @denisunderonov
            </a>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>О проекте</h4>
            <p className={styles.disclaimer}>
              Этот сайт не имеет ничего общего с компанией Cofix и ничего не продаёт.
              <br />
              Это лишь баловство одного из барист
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2025 Cofix на Курской. Сделано с любовью к кофе и гостям.
          </p>
        </div>
      </div>
    </footer>
  );
}
