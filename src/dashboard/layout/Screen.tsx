import Header from '../blocks/Header';
import Ads from '../blocks/Ads';
import Rating from '../blocks/Rating';
import Schedule from '../blocks/Schedule';
import Event from '../blocks/Event';

export default function Screen() {
  return (
    <div className="h-screen w-full grid grid-cols-3 gap-3 p-3 bg-black text-white">
      {/* LEFT: RATING */}
      <div className="bg-white/5 rounded-2xl p-4 overflow-hidden">
        <Rating />
      </div>

      {/* CENTER: HEADER + SCHEDULE */}
      <div className="grid grid-rows-4 gap-3">
        <div className="row-span-1 bg-white/5 rounded-2xl p-4">
          <Header />
        </div>

        <div className="row-span-3 bg-blue-500/10 rounded-2xl p-4 overflow-y-auto">
          <Schedule />
        </div>
      </div>

      {/* RIGHT: ADS + EVENT (ВАЖНО — FLEX ВЕРТИКАЛЬНО) */}
      <div className="flex flex-col gap-3">
        {/* ADS = 3/4 */}
        <div className="flex-[3] bg-orange-500/10 rounded-2xl p-4 overflow-hidden">
          <Ads />
        </div>

        {/* EVENT = 1/4 */}
        <div className="flex-[1] bg-yellow-500/10 rounded-2xl p-4 overflow-hidden">
          <Event />
        </div>
      </div>
    </div>
  );
}
