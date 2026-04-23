import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, PlayCircle } from 'lucide-react';

const URL =
  'https://script.google.com/macros/s/AKfycbwxjdAF05otqABZLt4yIU2L4ZvGeDAryl-whiZdTrNHLy94CRd9ZXkdfzLo0phflhdP/exec';

type Item = {
  date: string;
  start: string; // "8:00"
  end: string;   // "8:15"
  title: string;
  place: string;
  type: string;
};

/* ===================== TIME (MSK ONLY) ===================== */

function getMoscowNow() {
  const now = new Date();
  return new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
  );
}

function today() {
  return getMoscowNow().toLocaleDateString('sv-SE');
}

function tomorrow() {
  const d = getMoscowNow();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('sv-SE');
}

/* ===================== TIME PARSE ===================== */

// дата + время -> timestamp (МСК)
function getItemTime(item: Item, type: 'start' | 'end') {
  const [h, m] = item[type].split(':').map(Number);

  const base = new Date(
    new Date(item.date).toLocaleString('en-US', {
      timeZone: 'Europe/Moscow',
    })
  );

  base.setHours(h, m, 0, 0);

  return base.getTime();
}

// ISO дата -> YYYY-MM-DD (МСК)
function getDay(iso: string) {
  return new Date(iso).toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Moscow',
  });
}

/* ===================== COMPONENT ===================== */

export default function Schedule() {
  const [data, setData] = useState<Item[]>([]);
  const [now, setNow] = useState(getMoscowNow());

  // обновление времени
  useEffect(() => {
    const t = setInterval(() => setNow(getMoscowNow()), 30000);
    return () => clearInterval(t);
  }, []);

  // загрузка
  useEffect(() => {
    fetch(URL)
      .then((r) => r.json())
      .then((res) => setData(res || []))
      .catch(console.error);
  }, []);

  /* ===================== FILTER ===================== */

  const filtered = useMemo(() => {
    const t = today();
    const tm = tomorrow();

    return data.filter((i) => {
      const day = getDay(i.date);
      return day === t || day === tm;
    });
  }, [data]);

  /* ===================== SORT ===================== */

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => getItemTime(a, 'start') - getItemTime(b, 'start')
    );
  }, [filtered]);

  /* ===================== ACTIVE ===================== */

  const { before, active, after } = useMemo(() => {
    if (!sorted.length) return { before: [], active: null, after: [] };
  
    const nowMs = now.getTime();
  
    let index = sorted.findIndex((item) => {
      const start = getItemTime(item, 'start');
      let end = getItemTime(item, 'end');
  
      // фикс 22:00–22:00
      if (start === end) end = start + 5 * 60 * 1000;
  
      return nowMs >= start && nowMs <= end;
    });
  
    // если ничего не идёт — берём ближайшее будущее
    if (index === -1) {
      index = sorted.findIndex(
        (item) => getItemTime(item, 'start') > nowMs
      );
    }
  
    // если вообще ничего нет — берём последнее
    if (index === -1) index = sorted.length - 1;
  
    return {
      before: index > 0 ? [sorted[index - 1]] : [], // 👈 1 ДО
      active: sorted[index],                        // 👈 1 АКТИВНОЕ
      after: sorted.slice(index + 1, index + 3),    // 👈 2 ПОСЛЕ
    };
  }, [sorted, now]);

  /* ===================== PROGRESS ===================== */

  function progress(item: Item) {
    const nowMs = now.getTime();

    let start = getItemTime(item, 'start');
    let end = getItemTime(item, 'end');

    if (start === end) end = start + 5 * 60 * 1000;

    if (nowMs <= start) return 0;
    if (nowMs >= end) return 100;

    return ((nowMs - start) / (end - start)) * 100;
  }

  /* ===================== UI ===================== */

  const Card = ({ item, dim }: { item: Item; dim?: boolean }) => (
    <div
      className={`rounded-3xl p-4 border backdrop-blur-xl ${
        dim
          ? 'bg-white/5 border-white/10 opacity-60'
          : 'bg-white/10 border-white/20'
      }`}
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