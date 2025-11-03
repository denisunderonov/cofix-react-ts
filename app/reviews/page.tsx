import React from "react";
import PageContainer from "../components/PageContainer";

const reviews = [
  {
    id: "1",
    name: "Anna",
    avatar: "https://i.pravatar.cc/64?img=32",
    date: "2025-11-01",
    rating: 9,
    text: "Отличный эспрессо — насыщенный аромат и мягкая кислинка. Обязательно вернусь!",
  },
  {
    id: "2",
    name: "Ivan",
    avatar: "https://i.pravatar.cc/64?img=12",
    date: "2025-10-28",
    rating: 7,
    text: "Хороший латте, немного слишком горячий, но бариста приятный.",
  },
  {
    id: "3",
    name: "Olga",
    avatar: "https://i.pravatar.cc/64?img=5",
    date: "2025-09-15",
    rating: 10,
    text: "Лучший кофе в городе! Рекомендую всем любителям плотного вкуса.",
  },
];

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-4 h-4 ${filled ? "text-amber-400" : "text-slate-200"}`}
      aria-hidden
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.492 2.716c-.784.57-1.838-.197-1.539-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.507 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
    </svg>
  );
}

export default function ReviewsPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">Отзывы</h1>
      <p className="text-sm text-slate-500 mb-6">На все отзывы постараемся ответить, но ничего не обещаем :)</p>

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start gap-4">
              <img src={r.avatar} alt={`${r.name} avatar`} className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.date}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Ten-star rating */}
                    <div className="flex items-center">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Star key={i} filled={i < r.rating} />
                      ))}
                    </div>
                    <div className="ml-2 text-sm text-slate-500">{r.rating}/10</div>
                  </div>
                </div>

                <p className="mt-3 text-slate-700">{r.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
