import { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';

interface CityRating {
  city: string;
  points: number;
}

const RATING_URL =
  'https://script.google.com/macros/s/AKfycbzy9p9q5i9tMqKegiBWs8G5C--KIbA6anyDoHWh_1sWud5q1xcl5_lsXJiC-aumQN9sUA/exec';

export default function Rating() {
  const [data, setData] = useState<CityRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(RATING_URL)
      .then((r) => r.json())
      .then((res) => {
        if (!Array.isArray(res)) {
          setData([]);
          return;
        }

        const safe = res
          .filter((i) => i && i.city)
          .map((i) => ({
            city: String(i.city || ''),
            points: Number(i.points || 0),
          }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 15); // 👈 ТОП 15

        setData(safe);
      })
      .catch((err) => {
        console.error('Rating error:', err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-white/60 text-sm">Загрузка рейтинга...</div>;
  }

  if (!data.length) {
    return <div className="text-white/60 text-sm">Нет данных</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
        <Trophy size={16} />
        ТОП 15 городов
      </div>

      {data.map((item, i) => {
        const isTop3 = i < 3;

        return (
          <div
            key={`${item.city}-${i}`}
            className={[
              'flex items-center justify-between rounded-xl p-3 backdrop-blur-xl border',
              isTop3
                ? 'bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border-yellow-400/30'
                : 'bg-white/5 border-white/10',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <div
                className={[
                  'text-xs w-6 font-semibold',
                  isTop3 ? 'text-yellow-300' : 'text-white/40',
                ].join(' ')}
              >
                {i + 1}
              </div>

              <div className="font-medium text-white">{item.city}</div>
            </div>

            <div className="flex items-center gap-1 text-lime-300 font-semibold">
              <Star size={14} />
              {item.points}
            </div>
          </div>
        );
      })}
    </div>
  );
}
