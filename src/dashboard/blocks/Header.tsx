import { useEffect, useState } from 'react';
import { Clock, MapPin, Sun } from 'lucide-react';

export default function Header() {
  const [time, setTime] = useState<Date>(() => new Date());
  const [temp, setTemp] = useState<number | null>(null);

  // ===== CLOCK SAFE =====
  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(t);
  }, []);

  // ===== WEATHER SAFE =====
  useEffect(() => {
    let alive = true;

    async function loadWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=44.99&longitude=37.27&current_weather=true'
        );

        const data = await res.json();

        const t = data?.current_weather?.temperature;

        if (!alive) return;

        if (typeof t === 'number') {
          setTemp(Math.round(t));
        } else {
          setTemp(null);
        }
      } catch (e) {
        console.log('weather error', e);
        if (alive) setTemp(null);
      }
    }

    loadWeather();

    return () => {
      alive = false;
    };
  }, []);

  // ===== SAFE RENDER =====
  let safeTime = '00:00';
  let safeDate = '';

  try {
    safeTime = time.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    safeDate = time.toLocaleDateString('ru-RU');
  } catch (e) {
    console.log('time render error', e);
  }

  return (
    <div className="h-full flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-orange-400" />
        <div>
          <div className="text-orange-400 text-lg font-bold leading-tight">
            Республика Виталия
          </div>
          <div className="text-white/50 text-xs">Витязево / Анапа</div>
        </div>
      </div>

      {/* CENTER */}
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-white/60" />

        <div className="text-center">
          <div className="text-white text-xl font-semibold">{safeTime}</div>

          <div className="text-white/40 text-xs">{safeDate}</div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <Sun size={18} className="text-yellow-300" />

        <div className="text-right">
          <div className="text-white text-lg">
            {temp !== null ? `${temp}°C` : '—'}
          </div>
          <div className="text-white/40 text-xs">сейчас</div>
        </div>
      </div>
    </div>
  );
}
