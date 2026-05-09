import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Heart, Star, PenLine, Settings, Trophy, Play, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  getCoinsUntilNextLevel,
  getGrowthLevel,
  getGrowthProgress,
  getNextGrowthLevel,
  LevelJourney,
} from "@/lib/roadin";

type User = {
  id: number;
  name: string;
  university: string;
  major: string;
  interests: string;
  coins: number;
  attendanceWeeks: number;
};

const recentActivities = [
  { id: 1, icon: <MessageCircle className="h-5 w-5 text-white" />, iconBg: "bg-blue-500", title: "선배와 고민 상담 완료", coins: 30, time: "2시간 전" },
  { id: 2, icon: <Play className="h-5 w-5 text-white" />, iconBg: "bg-yellow-400", title: "IT 개발 세미나 시청 완료", coins: 20, time: "1일 전" },
  { id: 3, icon: <Users className="h-5 w-5 text-white" />, iconBg: "bg-green-500", title: "마케팅 동아리 활동 인증", coins: 15, time: "2일 전" },
  { id: 4, icon: <Trophy className="h-5 w-5 text-white" />, iconBg: "bg-blue-400", title: "공모전 팀원으로 지원", coins: 10, time: "3일 전" },
];

const shortcuts = [
  { icon: <MessageCircle className="h-5 w-5 text-slate-500" />, label: "나의 상담 내역", to: "/" },
  { icon: <Heart className="h-5 w-5 text-slate-500" />, label: "찜 목록", to: "/" },
  { icon: <Star className="h-5 w-5 text-slate-500" />, label: "참여한 활동", to: "/" },
  { icon: <PenLine className="h-5 w-5 text-slate-500" />, label: "내가 쓴 글", to: "/" },
  { icon: <Settings className="h-5 w-5 text-slate-500" />, label: "설정", to: "/" },
];

export function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/1")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-500">불러오는 중...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center py-20 text-slate-500">유저 정보를 불러올 수 없습니다.</div>;
  }

  const currentLevel = getGrowthLevel(user.coins);
  const nextLevel = getNextGrowthLevel(user.coins);
  const progressPercentage = getGrowthProgress(user.coins);
  const coinsUntilNext = getCoinsUntilNextLevel(user.coins);
  const minCoins = currentLevel.coins;
  const maxCoins = nextLevel ? nextLevel.coins : currentLevel.coins;

  return (
    <div className="space-y-6 pb-10">
      {/* 프로필 헤더 배너 */}
      <section className="rounded-2xl bg-blue-600 p-6 text-white shadow-md">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/30 bg-white/20">
              <img
                src={`/step${currentLevel.level}.png`}
                alt="맵지리"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black">{user.name}</h1>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                Lv.{currentLevel.level} {currentLevel.name}
              </span>
            </div>
            <div className="space-y-1 text-sm font-medium text-blue-100">
              <p>🏛 {user.university}</p>
              <p>🎓 {user.major}</p>
              <p>🤍 {user.interests}</p>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm font-bold text-blue-100">
              <span>다음 레벨까지</span>
              <span>{coinsUntilNext} 코인 남음</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20 [&>div]:bg-white" />
            <div className="flex justify-between text-xs font-semibold text-blue-200">
              <span>Lv.{currentLevel.level} {currentLevel.name}<br />({minCoins} 코인)</span>
              {nextLevel && (
                <span className="text-right">Lv.{nextLevel.level} {nextLevel.name}<br />({maxCoins} 코인)</span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">보유 코인</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-2xl">🪙</span>
              <span className="text-3xl font-black text-slate-900">{user.coins}</span>
              <span className="text-base font-bold text-slate-500">코인</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">({minCoins} ~ {maxCoins} 코인 구간)</p>
          </div>
        </div>
      </section>

      {/* 성장 단계 + 최근 활동 */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-slate-900">성장 단계</h2>
          <LevelJourney currentLevel={currentLevel.level} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">최근 활동</h2>
            <button className="flex items-center gap-0.5 text-sm font-bold text-blue-600">
              전체 보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${activity.iconBg}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{activity.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-600">+{activity.coins} 코인</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 바로가기 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">바로가기</h2>
        <div className="grid grid-cols-5 gap-3">
          {shortcuts.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2 py-4 text-center transition hover:bg-blue-50 hover:border-blue-100"
            >
              {item.icon}
              <span className="text-xs font-bold text-slate-600">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
