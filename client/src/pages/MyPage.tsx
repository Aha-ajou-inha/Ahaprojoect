import { Link } from "react-router-dom";
import { BadgeCheck, CalendarCheck2, Coins, Flame, Gift, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getAttendanceReward,
  getCoinsUntilNextLevel,
  getConsultCoinCost,
  getGrowthLevel,
  getGrowthProgress,
  getNextGrowthLevel,
  LevelJourney,
  Mapjiri,
  TransportIcon,
  userRoadInStats,
} from "@/lib/roadin";

const coinHistory = [
  { id: 1, title: "연속 출석 2주차 보상", amount: 3, type: "earn", date: "오늘" },
  { id: 2, title: "Lv.3 따릉이 멘토 60분 상담", amount: -getConsultCoinCost(60, 3), type: "spend", date: "어제" },
  { id: 3, title: "스터디 로드 모집글 작성", amount: 20, type: "earn", date: "5월 7일" },
  { id: 4, title: "AI 활동 추천 완료", amount: 10, type: "earn", date: "5월 6일" },
];

const missions = [
  { id: 1, title: "오늘 관심 공모전 1개 저장", reward: 1, progress: 67 },
];

export function MyPage() {
  const user = {
    name: userRoadInStats.name,
    university: "세종대학교",
    major: "컴퓨터공학과",
    year: 3,
    coins: userRoadInStats.coins,
    goal: "이번 학기에는 React 프로젝트 2개 완성, 오픈소스 기여 1회 달성",
  };

  const currentLevel = getGrowthLevel(user.coins);
  const nextLevel = getNextGrowthLevel(user.coins);
  const progressPercentage = getGrowthProgress(user.coins);
  const coinsUntilNext = getCoinsUntilNextLevel(user.coins);
  const attendanceReward = getAttendanceReward(userRoadInStats.attendanceWeeks);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">나의 Road-In</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            맵지리와 함께 코인을 모으고 다음 이동수단으로 성장하세요.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/onboarding">프로필 수정</Link>
        </Button>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden border-blue-100">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[120px_1fr]">
            <Mapjiri level={currentLevel.level} className="mx-auto h-28 w-28" />
            <div className="min-w-0 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black">{user.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {user.university} · {user.major} · {user.year}학년
                  </p>
                </div>
                <Badge className={`w-fit px-3 py-1.5 text-sm font-black ${currentLevel.tone}`}>
                  Lv.{currentLevel.level} {currentLevel.name}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Coins className="mb-2 h-4 w-4 text-blue-700" />
                  <p className="text-xs font-bold text-slate-500">보유 코인</p>
                  <p className="text-xl font-black text-slate-950">{user.coins} C</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <TransportIcon level={currentLevel.level} className="mb-2 h-4 w-4 text-emerald-700" />
                  <p className="text-xs font-bold text-slate-500">이동수단</p>
                  <p className="text-xl font-black text-slate-950">{currentLevel.transport}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <Target className="mb-2 h-4 w-4 text-amber-600" />
                  <p className="text-xs font-bold text-slate-500">대관 할인</p>
                  <p className="text-xl font-black text-slate-950">{currentLevel.discount}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">
                    {nextLevel ? `다음 등급: Lv.${nextLevel.level} ${nextLevel.name}` : "최고 등급 도착"}
                  </span>
                  <span className="font-black text-blue-700">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3 bg-blue-100" />
                <p className="text-xs font-bold text-slate-500">
                  {nextLevel ? `${coinsUntilNext}코인을 더 모으면 ${nextLevel.transport}로 이동합니다.` : "우주대장까지 성장했습니다."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <CalendarCheck2 className="h-5 w-5 text-blue-700" />
              연속 출석 보상
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-4xl font-black text-blue-700">
              +{attendanceReward} <span className="text-xl text-slate-700">C</span>
            </div>
            <p className="text-sm font-medium leading-6 text-slate-600">
              오늘 로드미션을 완료해야 출석이 인정됩니다. 현재 {userRoadInStats.attendanceWeeks}주 연속 출석 중입니다.
            </p>
            <Progress value={userRoadInStats.attendanceProgress} className="mt-4 h-2 bg-white" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-black">맵지리의 성장 여정</CardTitle>
        </CardHeader>
        <CardContent>
          <LevelJourney currentLevel={currentLevel.level} />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Target className="h-5 w-5 text-emerald-600" />
                현재 목적지
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                {user.goal}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">Open Source</Badge>
                <Badge variant="secondary">Road-In 루트</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-black">코인 활동 내역</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coinHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4">
                  <div>
                    <p className="font-black text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">{item.date}</p>
                  </div>
                  <span className={`text-lg font-black ${item.type === "earn" ? "text-blue-700" : "text-red-500"}`}>
                    {item.amount > 0 ? "+" : ""}
                    {item.amount} C
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Flame className="h-5 w-5 text-red-500" />
                오늘의 로드 미션
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {missions.map((mission) => (
                <div key={mission.id} className="space-y-2 rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{mission.title}</p>
                      <p className="mt-1 text-sm font-bold text-blue-700">완료 시 출석 인정 · +{mission.reward} C</p>
                    </div>
                    {mission.progress === 100 ? <BadgeCheck className="h-5 w-5 text-emerald-600" /> : <Gift className="h-5 w-5 text-slate-400" />}
                  </div>
                  <Progress value={mission.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
