import { useState } from 'react';
import { Eye, BarChart3 } from 'lucide-react';

import Header from '../blocks/Header';
import Ads from '../blocks/Ads';
import Rating from '../blocks/Rating';
import Schedule from '../blocks/Schedule';

export default function Screen() {
  const [showAdsLeft, setShowAdsLeft] = useState(() => {
    return localStorage.getItem('leftBlock') === 'ads';
  });

  const toggle = () => {
    setShowAdsLeft((prev) => {
      const next = !prev;
      localStorage.setItem('leftBlock', next ? 'ads' : 'rating');
      return next;
    });
  };

  return (
    <div className="h-screen w-full grid grid-cols-3 gap-3 p-3 bg-black text-white">

      {/* LEFT: SWITCH BLOCK */}
      <div className="bg-white/5 rounded-2xl p-4 overflow-hidden relative">

        {/* НЕЗАМЕТНАЯ КНОПКА */}
        <button
          onClick={toggle}
          className="absolute top-2 right-2 z-10 opacity-30 hover:opacity-80 transition"
        >
          {showAdsLeft ? <BarChart3 size={16} /> : <Eye size={16} />}
        </button>

        {/* КОНТЕНТ */}
        {showAdsLeft ? <Ads key="ads-left" /> : <Rating />}
      </div>

      {/* CENTER */}
      <div className="grid grid-rows-4 gap-3">
        <div className="row-span-1 bg-white/5 rounded-2xl p-4">
          <Header />
        </div>

        <div className="row-span-3 bg-blue-500/10 rounded-2xl p-4 overflow-y-auto">
          <Schedule />
        </div>
      </div>

      {/* RIGHT */}
      <div className="bg-orange-500/10 rounded-2xl p-4 overflow-hidden">
        <Ads key="ads-right" />
      </div>

    </div>
  );
}