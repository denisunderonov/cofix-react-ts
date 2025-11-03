import React from "react";
import PageContainer from "../components/PageContainer";

export default function GaleryPage() {
  const count = 12;
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">Фотографии!</h1>
      <p className="text-sm text-slate-500 mb-6">
        Жизнь нашей кофейни
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <figure
            key={i}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={`https://source.unsplash.com/random/800x600?coffee&sig=${i}`}
              alt="Фотография из кофейни"
              className="w-full h-48 object-cover"
            />
          </figure>
        ))}
      </div>
    </PageContainer>
  );
}
