import { AdSenseUnit } from "@/components/AdSenseUnit";

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Shop Smarter with AI
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Get instant AI-powered review summaries and price comparisons on
          Amazon, Shopee, and Lazada — right on the product page.
        </p>
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Add to Chrome — It&apos;s Free
        </a>
        <p className="mt-3 text-sm text-gray-400">No signup required</p>
      </div>

      {/* AdSense */}
      <AdSenseUnit slot="1111111111" format="horizontal" className="mb-12" />

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🛍️",
              title: "Open any product page",
              desc: "Browse Amazon, Shopee, or Lazada as usual",
            },
            {
              icon: "🤖",
              title: "Click the extension",
              desc: "AI instantly reads and summarizes all reviews",
            },
            {
              icon: "💰",
              title: "See the best price",
              desc: "Compare prices across stores and buy smart",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm"
            >
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported stores */}
      <div className="text-center text-sm text-gray-500">
        <p className="mb-2 font-medium text-gray-700">Works on</p>
        <div className="flex items-center justify-center gap-6 text-2xl">
          <span title="Amazon">🛒 Amazon</span>
          <span title="Shopee">🟠 Shopee</span>
          <span title="Lazada">🔴 Lazada</span>
        </div>
      </div>
    </main>
  );
}
