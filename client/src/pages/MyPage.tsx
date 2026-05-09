import { Navigate, Link } from "react-router-dom";
import { BadgeCheck, Coins, Flame, Gift, Star, Target, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/useAuthStore";

const coinHistory = [
  { id: 1, title: "포트폴리오 피드백 요청", amount: 30, type: "earn", date: "오늘" },
  { id: 2, title: "멘토링 30분 예약", amount: -50, type: "spend", date: "어제" },
  { id: 3, title: "스터디 모집글 작성", amount: 20, type: "earn", date: "5월 7일" },
  { id: 4, title: "AI 활동 추천 완료", amount: 10, type: "earn", date: "5월 6일" },
];

const missions = [
  { id: 1, title: "관심 공모전 3개 저장", reward: 20, progress: 67 },
  { id: 2, title: "커뮤니티 댓글 5개 작성", reward: 30, progress: 40 },
  { id: 3, title: "멘토링 후기 작성", reward: 50, progress: 0 },
];

export function MyPage() {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const user = {
    name: "김세종",
    university: "세종대학교",
    major: "컴퓨터공학과",
    year: 3,
    grade: "Lv.3 프로 메이커",
    exp: 2800,
    maxExp: 5000,
    coins: 1200,
    badges: ["첫 해커톤 완료", "인기 질문러", "코드 리뷰어"],
    goal: "이번 학기에는 React 프로젝트 2개 완성, 오픈소스 기여 1회 달성",
  };

  const progressPercentage = (user.exp / user.maxExp) * 100;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">마이페이지</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            프로필, 목표, 코인, 미션을 한 곳에서 관리하세요.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/onboarding">프로필 수정</Link>
        </Button>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 border-4 border-blue-50">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-600 text-3xl font-black text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black">{user.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {user.university} · {user.major} · {user.year}학년
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit bg-blue-50 px-3 py-1.5 text-sm font-black text-blue-700">
                  {user.grade}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">다음 레벨까지</span>
                  <span className="font-black text-blue-700">
                    {user.exp} / {user.maxExp} EXP
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Coins className="h-5 w-5 text-blue-700" />
              보유 코인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-4xl font-black text-blue-700">
              {user.coins.toLocaleString()} <span className="text-xl text-slate-700">C</span>
            </div>
            <p className="text-sm font-medium leading-6 text-slate-600">
              활동 보상으로 코인을 모으고 멘토링 예약에 사용할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Target className="h-5 w-5 text-emerald-600" />
                현재 목표
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                {user.goal}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">Open Source</Badge>
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
                <Trophy className="h-5 w-5 text-amber-500" />
                획득 배지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="bg-white px-3 py-1.5 text-sm font-bold">
                    <Star className="mr-2 h-3.5 w-3.5 text-amber-500" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Flame className="h-5 w-5 text-red-500" />
                주간 미션
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {missions.map((mission) => (
                <div key={mission.id} className="space-y-2 rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{mission.title}</p>
                      <p className="mt-1 text-sm font-bold text-blue-700">+{mission.reward} C</p>
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
