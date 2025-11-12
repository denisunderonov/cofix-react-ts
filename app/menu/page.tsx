"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Drink {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ingredients: string[];
  rating: number;
  reviews_count: number;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [drinkReviews, setDrinkReviews] = useState<Review[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка напитков из БД
  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const response = await fetch("/api/drinks");
      const data = await response.json();
      if (data.success) {
        setDrinks(data.drinks);
      }
    } catch (error) {
      console.error("Ошибка загрузки напитков:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrinkReviews = async (drinkId: number) => {
    try {
      const response = await fetch(`/api/drinks/${drinkId}/reviews`);
      const data = await response.json();
      if (data.success) {
        setDrinkReviews(data.reviews);
      }
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
    }
  };

  const categories = [
    { id: "all", name: "Все напитки" },
    { id: "coffee", name: "Кофе" },
    { id: "tea", name: "Чай" },
    { id: "cold", name: "Холодные напитки" },
    { id: "other", name: "Другие" },
  ];

  const filteredDrinks =
    selectedCategory === "all"
      ? drinks
      : drinks.filter((drink) => drink.category === selectedCategory);

  const handleAddReview = async (drinkId: number) => {
    try {
      const response = await fetch(`/api/drinks/${drinkId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (data.success) {
        setNewReview({ rating: 5, comment: "" });
        setShowReviews(false);
        setSelectedDrink(null);
        // Обновляем отзывы
        if (selectedDrink) {
          fetchDrinkReviews(selectedDrink.id);
        }
      }
    } catch (error) {
      console.error("Ошибка добавления отзыва:", error);
    }
  };

  const openDrinkDetails = async (drink: Drink) => {
    setSelectedDrink(drink);
    setShowReviews(false);
    await fetchDrinkReviews(drink.id);
  };

  const openReviews = async (drink: Drink) => {
    setSelectedDrink(drink);
    setShowReviews(true);
    await fetchDrinkReviews(drink.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-brown-600">Загрузка меню...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Хлебные крошки */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-amber-700 hover:text-amber-800 transition-colors"
          >
            Главная
          </Link>
          <span className="mx-2 text-brown-400">/</span>
          <span className="text-brown-600">Меню</span>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brown-900 mb-4">Меню</h1>
          <p className="text-brown-600 text-lg max-w-2xl mx-auto">
            Тут вы можете посмотреть все доступные напитки, их состав и отзывы
            гостей
          </p>
        </div>

        {/* Фильтры по категориям */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-amber-50 text-brown-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Сетка напитков */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredDrinks.map((drink) => (
            <div
              key={drink.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100 overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-amber-100 to-brown-100 flex items-center justify-center">
                <span className="text-6xl">☕</span>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-brown-900">
                    {drink.name}
                  </h3>
                  <span className="text-2xl font-bold text-amber-600">
                    {drink.price}₽
                  </span>
                </div>

                <p className="text-brown-600 mb-4 line-clamp-2">
                  {drink.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= Math.round(drink.rating)
                            ? "text-amber-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-brown-500 text-sm ml-2">
                      ({drink.reviews_count})
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openDrinkDetails(drink)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    Состав
                  </button>
                  <button
                    onClick={() => openReviews(drink)}
                    className="flex-1 bg-white border border-amber-500 text-amber-600 hover:bg-amber-50 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    Отзывы
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Модальное окно с деталями напитка */}
        {selectedDrink && !showReviews && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-brown-900">
                    {selectedDrink.name}
                  </h2>
                  <button
                    onClick={() => setSelectedDrink(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="h-48 bg-gradient-to-br from-amber-100 to-brown-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-6xl">☕</span>
                </div>

                <p className="text-brown-600 mb-6">
                  {selectedDrink.description}
                </p>

                <div className="mb-6">
                  <h3 className="font-semibold text-brown-900 mb-3">Состав:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrink.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-amber-600">
                    {selectedDrink.price}₽
                  </span>
                  <button
                    onClick={() => setShowReviews(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-lg transition-colors"
                  >
                    Оставить отзыв
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно с отзывами */}
        {selectedDrink && showReviews && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-brown-900">
                    Отзывы: {selectedDrink.name}
                  </h2>
                  <button
                    onClick={() => setShowReviews(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Форма добавления отзыва */}
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-semibold text-brown-900 mb-3">
                    Оставить отзыв
                  </h3>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-brown-700 mb-2">
                      Оценка:
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setNewReview({ ...newReview, rating: star })
                          }
                          className={`text-2xl ${
                            star <= newReview.rating
                              ? "text-amber-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-brown-700 mb-2">
                      Комментарий:
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      rows={3}
                      placeholder="Поделитесь вашим мнением..."
                    />
                  </div>

                  <button
                    onClick={() => handleAddReview(selectedDrink.id)}
                    disabled={!newReview.comment.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Отправить отзыв
                  </button>
                </div>

                {/* Список отзывов */}
                <div>
                  <h3 className="font-semibold text-brown-900 mb-4">
                    Все отзывы ({drinkReviews.length})
                  </h3>

                  {drinkReviews.length === 0 ? (
                    <p className="text-brown-500 text-center py-4">
                      Пока нет отзывов. Будьте первым!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {drinkReviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-amber-100 pb-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-brown-900">
                              {review.user_name}
                            </span>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-sm ${
                                    star <= review.rating
                                      ? "text-amber-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-brown-600 text-sm mb-2">
                            {review.comment}
                          </p>
                          <span className="text-brown-400 text-xs">
                            {new Date(review.created_at).toLocaleDateString(
                              "ru-RU"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
