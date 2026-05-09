import { Bike, Car, Footprints, Rocket, Zap } from "lucide-react";

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

export function Mapjiri({ level = 1, className = "" }: MapjiriProps) {
  const clampedLevel = Math.min(Math.max(level, 1), 5);
  return (
    <img
      src={`/step${clampedLevel}.png`}
      alt={`맵지리 Lv.${clampedLevel}`}
      className={className}
    />
  );
}

export function LevelJourney({ currentLevel = 3 }: { currentLevel?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {growthLevels.map((level) => {
        const isActive = level.level === currentLevel;
        const isPast = level.level < currentLevel;

        return (
          <div
            key={level.name}
            className={`relative rounded-xl border p-4 text-center shadow-sm transition-all ${
              isActive
                ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
                : isPast
                  ? "border-slate-200 bg-white opacity-70"
                  : "border-slate-200 bg-white"
            }`}
          >
            <img
              src={`/step${level.level}.png`}
              alt={level.name}
              className="mx-auto mb-2 h-20 w-20 object-contain"
            />
            <p className="text-xs font-bold text-slate-400">Lv.{level.level}</p>
            <h3 className="mt-0.5 text-base font-black text-slate-900">{level.name}</h3>
            <p className="text-xs font-semibold text-slate-400">({level.transport})</p>
            <p className="mt-2 text-sm font-bold text-slate-500">{level.coins} 코인</p>
            {isActive && (
              <span className="mt-2 inline-flex rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black text-white">
                한재 단계
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
