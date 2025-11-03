import React from "react";
import PageContainer from "../components/PageContainer";

export default function AboutPage() {
  return (
    <PageContainer>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">О сайте</h1>
        <p className="text-sm text-slate-500 mt-2">
          Этот сайт никак не связан с компанией COFIX, он ничего не продает. Этот сайт - плод безделия и любопытства одного из барист точки cofix на курской.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <main className="md:col-span-2 space-y-4">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Контакты</h2>
            <p className="text-sm text-slate-700">Если хотите связаться со мной или у вас есть какие-либо предложения по улучшению сайта, то можете писать мне в telegram: <a href="https://t.me/denisunderonov">@denisunderonov</a>. </p>
          </section>
        </main>
      </div>
    </PageContainer>
  );
}
