import { useEffect, useState } from 'react';

const ads = [
  { img: '/ads/poster1.jpg' },
  { img: '/ads/poster2.jpg' },
  { img: '/ads/poster3.jpg' },
  { img: '/ads/poster4.jpg' },
];

export default function Ads() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, 30000); // 30 секунд

    return () => clearInterval(t);
  }, []);

  const ad = ads[index];

  return (
    <div className="h-full w-full flex items-center justify-center bg-black/90">
      {/* A4 вертикальный формат */}
      <div className="relative aspect-[3/4] h-full max-h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <img
          src={ad.img}
          alt=""
          className="w-full h-full object-cover transition-all duration-700"
        />
        {/* затемнение */}
        <div className="absolute inset-0 bg-black/10" />
      </div>
    </div>
  );
}