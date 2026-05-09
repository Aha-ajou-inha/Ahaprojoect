import { Bike, Car, Footprints, Map, Rocket, Zap } from "lucide-react";

export type GrowthLevel = {
  level: number;
  name: string;
  transport: string;
  coins: number;
  discount: number;
  tone: string;
};

export const growthLevels: GrowthLevel[] = [
  { level: 1, name: "뚜벅이", transport: "도보", coins: 0, discount: 0, tone: "text-slate-600 bg-slate-100" },
  { level: 2, name: "씽씽이", transport: "킥보드", coins: 50, discount: 0, tone: "text-blue-700 bg-blue-50" },
  { level: 3, name: "따릉이", transport: "자전거", coins: 200, discount: 3, tone: "text-emerald-700 bg-emerald-50" },
  { level: 4, name: "붕붕이", transport: "자동차", coins: 500, discount: 10, tone: "text-amber-700 bg-amber-50" },
  { level: 5, name: "우주대장", transport: "우주선", coins: 1000, discount: 20, tone: "text-violet-700 bg-violet-50" },
];

export const userRoadInStats = {
  name: "김세종",
  coins: 320,
  career: "프론트엔드 지망 · 활동 경력 2년",
  attendanceWeeks: 2,
  attendanceProgress: 67,
};

export function getGrowthLevel(coins: number) {
  return [...growthLevels].reverse().find((level) => coins >= level.coins) ?? growthLevels[0];
}

export function getNextGrowthLevel(coins: number) {
  return growthLevels.find((level) => level.coins > coins) ?? null;
}

export function getGrowthProgress(coins: number) {
  const current = getGrowthLevel(coins);
  const next = getNextGrowthLevel(coins);

  if (!next) {
    return 100;
  }

  return Math.round(((coins - current.coins) / (next.coins - current.coins)) * 100);
}

export function getCoinsUntilNextLevel(coins: number) {
  const next = getNextGrowthLevel(coins);
  return next ? next.coins - coins : 0;
}

export function getAttendanceReward(weeks: number) {
  if (weeks >= 3) {
    return 6;
  }

  if (weeks >= 2) {
    return 3;
  }

  return 1;
}

export function getConsultCoinCost(minutes: number, mentorLevel: number) {
  return Math.ceil(minutes / 10) * mentorLevel;
}

type TransportIconProps = {
  level: number;
  className?: string;
};

export function TransportIcon({ level, className = "h-5 w-5" }: TransportIconProps) {
  if (level >= 5) {
    return <Rocket className={className} />;
  }

  if (level >= 4) {
    return <Car className={className} />;
  }

  if (level >= 3) {
    return <Bike className={className} />;
  }

  if (level >= 2) {
    return <Zap className={className} />;
  }

  return <Footprints className={className} />;
}

type MapjiriProps = {
  level?: number;
  className?: string;
};

export function Mapjiri({ level = 3, className = "" }: MapjiriProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-label="맵지리">
      <div className="absolute -bottom-2 h-4 w-20 rounded-full bg-blue-900/10 blur-sm" />
      <div className="absolute left-1 top-12 h-8 w-3 -rotate-12 rounded-full bg-white shadow-sm" />
      <div className="absolute right-1 top-12 h-8 w-3 rotate-12 rounded-full bg-white shadow-sm" />
      <div className="relative h-20 w-20 overflow-hidden rounded-[1.15rem] border-[3px] border-blue-500 bg-white shadow-lg">
        <div className="absolute inset-y-0 left-0 w-[34%] bg-blue-50" />
        <div className="absolute inset-y-0 left-[34%] w-[33%] bg-white" />
        <div className="absolute inset-y-0 right-0 w-[33%] bg-blue-100/80" />
        <div className="absolute bottom-2 left-2 h-14 w-14 rounded-full border-2 border-dashed border-blue-200" />
        <div className="absolute left-[32%] top-0 h-full w-px bg-blue-200" />
        <div className="absolute left-[66%] top-0 h-full w-px bg-blue-200" />
        <div className="absolute right-0 top-0 h-0 w-0 border-l-[22px] border-t-[22px] border-l-transparent border-t-blue-500" />
        <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
          <Map className="h-4 w-4" />
        </div>
        <div className="absolute left-[22px] top-[38px] h-3.5 w-2.5 rounded-full bg-slate-950" />
        <div className="absolute right-[22px] top-[38px] h-3.5 w-2.5 rounded-full bg-slate-950" />
        <div className="absolute left-[15px] top-[51px] h-2 w-3 rounded-full bg-pink-200/80" />
        <div className="absolute right-[15px] top-[51px] h-2 w-3 rounded-full bg-pink-200/80" />
        <div className="absolute left-1/2 top-[51px] h-2.5 w-5 -translate-x-1/2 rounded-b-full border-b-[3px] border-slate-950" />
        {level >= 2 && level < 4 && (
          <div className="absolute -top-1 left-3 h-6 w-14 rounded-t-full bg-emerald-400 shadow-sm">
            <div className="absolute right-2 top-1 h-2 w-2 rounded-full bg-white/80" />
            <div className="absolute right-5 top-1 h-2 w-1.5 rounded-full bg-white/70" />
          </div>
        )}
        {level >= 5 && (
          <div className="absolute inset-x-1 -top-2 h-9 rounded-full border-4 border-violet-200 bg-white/50" />
        )}
      </div>
      <div className="absolute -bottom-3 left-1/2 flex h-8 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white text-blue-700 shadow-md">
        <TransportIcon level={level} className="h-4 w-4" />
      </div>
      {level >= 4 && level < 5 && (
        <div className="absolute -bottom-1 right-1 h-7 w-12 rounded-full bg-amber-300 shadow-sm">
          <div className="absolute bottom-0 left-2 h-2 w-2 rounded-full bg-slate-700" />
          <div className="absolute bottom-0 right-2 h-2 w-2 rounded-full bg-slate-700" />
        </div>
      )}
      {level >= 5 && (
        <div className="absolute -bottom-2 h-8 w-20 rounded-[50%] bg-violet-100 shadow-sm">
          <div className="absolute bottom-1 left-1 h-3 w-6 rounded-full bg-violet-400" />
          <div className="absolute bottom-1 right-1 h-3 w-6 rounded-full bg-violet-400" />
        </div>
      )}
    </div>
  );
}

export function LevelJourney({ currentLevel = 3 }: { currentLevel?: number }) {
  const descriptions = [
    "천천히 길을 익히는 단계",
    "킥보드로 더 멀리 나가는 단계",
    "자전거로 다양한 길을 탐험",
    "자동차로 빠르게 목표에 접근",
    "우주선으로 최종 목적지까지",
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {growthLevels.map((level, index) => {
        const isActive = level.level === currentLevel;
        const isPast = level.level < currentLevel;

        return (
          <div
            key={level.name}
            className={`relative rounded-lg border p-3 text-center shadow-sm transition-all ${
              isActive
                ? "border-blue-200 bg-blue-50 ring-2 ring-blue-100"
                : isPast
                  ? "border-emerald-100 bg-emerald-50/70"
                  : "border-slate-200 bg-white"
            }`}
          >
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
              <TransportIcon level={level.level} className="h-6 w-6" />
            </div>
            <p className="text-xs font-black text-slate-500">Lv.{level.level}</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">{level.name}</h3>
            <p className="mt-1 text-xs font-bold text-slate-500">{level.transport}</p>
            <p className="mt-3 min-h-8 text-xs font-semibold leading-4 text-slate-500">{descriptions[index]}</p>
            {isActive && (
              <span className="mt-3 inline-flex rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-black text-white">
                현재 위치
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
