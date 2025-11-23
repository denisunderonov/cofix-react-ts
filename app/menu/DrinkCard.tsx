"use client";

import React from "react";
import Link from "next/link";
import styles from "./DrinkCard.module.scss";
import { useAuth } from "../contexts/AuthContext";

type Drink = {
  id: number | string;
  name: string;
  description?: string;
  price?: number;
  rating?: number | string;
  image?: string;
  reviews_count?: number;
};

export default function DrinkCard({ drink, onEdit }: { drink: Drink, onEdit?: (d: Drink) => void }) {
  const short = (drink.description || "").slice(0, 120);
  const { user } = useAuth();

  return (
    <Link href={`/menu/${drink.id}`} className={styles.cardLink} aria-label={`Открыть ${drink.name}`}>
      <div className={styles.card}>
        {user?.role === 'creator' && (
          <button
            className={styles.editBtn}
            onClick={(e) => {
              // prevent Link navigation
              e.preventDefault();
              e.stopPropagation();
              if (onEdit) onEdit(drink);
            }}
            aria-label={`Редактировать ${drink.name}`}
          >
            ✎
          </button>
        )}
        <div className={styles.media}>
          <img 
            src={drink.image ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500'}${drink.image}` : `https://source.unsplash.com/800x600?coffee&sig=${drink.id}`} 
            alt={drink.name} 
          />
        </div>

        <div className={styles.body}>
          <div className={styles.titleRow}>
            <div className={styles.name}>{drink.name}</div>
            <div className={styles.price}>{drink.price ? `${drink.price}₽` : "—"}</div>
          </div>

          <div className={styles.desc}>{short}{(drink.description||"").length > 120 ? "..." : ""}</div>

          <div className={styles.rating}>
            {/* On menu cards we show only numeric rating prominently (no stars) */}
            <div className={styles.ratingNumber} aria-label={`Рейтинг ${drink.rating ?? 0}`}>
              {(() => {
                const raw = drink.rating;
                const num = typeof raw === 'number' ? raw : raw ? parseFloat(String(raw)) : NaN;
                return Number.isFinite(num) ? (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2) : '—';
              })()}
            </div>
            <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>{drink.reviews_count ?? 0} отзывов</div>
          </div>

        </div>
      </div>
    </Link>
  );
}
