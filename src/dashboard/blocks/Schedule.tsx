import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, PlayCircle } from 'lucide-react';

const URL =
  'https://script.google.com/macros/s/AKfycbwxjdAF05otqABZLt4yIU2L4ZvGeDAryl-whiZdTrNHLy94CRd9ZXkdfzLo0phflhdP/exec';

type Item = {
  date: string;
  start: string;
  end: string;
  title: string;
  place: string;
  type: string;
};

/* ===================== FIX GOOGLE TIME ===================== */

// "1899-12-30T05:29:43.000Z" -> minutes of day
function parseGoogleTime(iso: string) {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

// "2026-04-22T00:00:00.000Z" -> YYYY-MM-DD
function getDay(iso: string) {
  return new Date(iso).toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Moscow',
  });
}

// today YYYY-MM-DD
function today() {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Moscow',
  });
}

// tomorrow YYYY-MM-DD
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Moscow',
  });
}

/* ===================== COMPONENT ===================== */

export default function Schedule() {
  const [data, setData] = useState<Item[]>([]);
  const [now, setNow] = useState(new Date());

  const currentMin = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(URL)
      .then((r) => r.json())
      .then((res) => {
        setData(res || []);
      })
      .catch(console.error);
  }, []);

  /* ===================== FILTER TODAY + TOMORROW ===================== */

  const filtered = useMemo(() => {
    return data.filter((i) => {
      const day = getDay(i.date);
      return day === today() || day === tomorrow();
    });
  }, [data]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => parseGoogleTime(a.start) - parseGoogleTime(b.start)
    );
  }, [filtered]);

  /* ===================== ACTIVE LOGIC ===================== */

  const { before, active, after } = useMemo(() => {
    if (!sorted.length) return { before: [], active: null, after: [] };

    let index = sorted.findIndex((i) => {
      const s = parseGoogleTime(i.start);
      const e = parseGoogleTime(i.end);
      return currentMin >= s && currentMin <= e;
    });

    if (index === -1) {
      index = sorted.findIndex((i) => parseGoogleTime(i.start) > currentMin);
    }

    if (index === -1) index = sorted.length - 1;

    return {
      before: sorted.slice(Math.max(0, index - 3), index),
      active: sorted[index],
      after: sorted.slice(index + 1, index + 4),
    };
  }, [sorted, currentMin]);

  /* ===================== PROGRESS ===================== */
  function progress(item: Item) {
    const s = parseGoogleTime(item.start);
    const e = parseGoogleTime(item.end);

    // 🚨 защита от битых данных
    if (!isFinite(s) || !isFinite(e)) return 0;

    // 🚨 защита от нулевой длительности
    if (e <= s) return 0;

    if (currentMin <= s) return 0;
    if (currentMin >= e) return 100;

    return ((currentMin - s) / (e - s)) * 100;
  }

  /* ===================== UI ===================== */

  const Card = ({ item, dim }: { item: Item; dim?: boolean }) => (
    <div
      className={`
        rounded-3xl p-4 border backdrop-blur-xl transition-all
        ${
          dim
            ? 'bg-white/5 border-white/10 opacity-60'
            : 'bg-white/10 border-white/20'
        }
      `}
    >
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Clock size={14} />
        {item.start} – {item.end}
      </div>

      <div className="font-semibold text-white mt-1">{item.title}</div>

      <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
        <MapPin size={14} />
        {item.place}
      </div>
    </div>
  );

  const Active = ({ item }: { item: Item }) => (
    <div className="rounded-3xl p-5 border border-lime-400/30 bg-lime-500/10 backdrop-blur-2xl shadow-xl scale-[1.02]">
      <div className="flex items-center gap-2 text-lime-300 text-xs">
        <PlayCircle size={14} />
        Сейчас идёт
      </div>

      <div className="text-lg font-semibold text-white mt-1">{item.title}</div>

      <div className="text-sm text-white/60 mt-1">
        {item.start} – {item.end}
      </div>

      {/* iOS STYLE PROGRESS */}
      <div className="h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-lime-300 via-lime-400 to-green-400 transition-all duration-500"
          style={{ width: `${progress(item)}%` }}
        />
      </div>

      <div className="text-[10px] text-white/40 mt-1 text-right">
        {Math.round(progress(item))}%
      </div>
    </div>
  );

  /* ===================== EMPTY ===================== */

  if (!sorted.length) {
    return <div className="p-4 text-white/60">Нет данных</div>;
  }

  /* ===================== RENDER ===================== */

  return (
    <div className="p-4 space-y-3 text-white">
      {before.map((i, idx) => (
        <Card key={`b-${idx}`} item={i} dim />
      ))}

      {active && <Active item={active} />}

      {after.map((i, idx) => (
        <Card key={`a-${idx}`} item={i} />
      ))}
    </div>
  );
}
