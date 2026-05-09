import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, CalendarDays, CheckCircle2, PenLine, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api";

type HomeContest = {
  id: number;
  title: string;
  dDay: string;
  views: string | number;
  viewLabel?: string;
  image: string;
  imageUrl?: string;
  organizer?: string;
};

type HomeTeam = {
  id: number;
  title: string;
  role: string;
  tag: string;
};

const quickLinks = [
  { label: "공모전 탐색", href: "/recommendation", icon: Search, tone: "bg-blue-50 text-blue-700" },
  { label: "모집 게시판", href: "/recruitment", icon: Users, tone: "bg-emerald-50 text-emerald-700" },
  { label: "AI 활동 추천", href: "/ai-matching", icon: Bot, tone: "bg-violet-50 text-violet-700" },
  { label: "포트폴리오 점검", href: "/portfolio", icon: PenLine, tone: "bg-amber-50 text-amber-700" },
];

export function Home() {
  const dummyContests = useMemo<HomeContest[]>(() => [
    {
      id: 1,
      title: "2026년 트래블 이노베이션 아이디어 공모전",
      dDay: "D-61",
      views: "1,946",
      organizer: "야놀자 Research",
      image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      id: 2,
      title: "제5회 고용노동 공공데이터·AI 활용 공모전",
      dDay: "D-5",
      views: "2,995",
      organizer: "고용노동부",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      id: 3,
      title: "[넥슨] 메이플스토리 해커톤, 2026 메커톤",
      dDay: "D-2",
      views: "1,822",
      organizer: "넥슨 코리아",
      image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      id: 4,
      title: "제13회 산업안전보건 조사자료 논문경진대회",
      dDay: "D-22",
      views: "2,032",
      organizer: "안전보건공단",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400&h=400",
    },
  ], []);

  const dummyTeams = useMemo<HomeTeam[]>(() => [
    { id: 1, title: "IT 서비스 창업 동아리 SOPT 팀원 구합니다", role: "프론트엔드 1명", tag: "동아리" },
    { id: 2, title: "주 2회 강남역 알고리즘 코테 뿌시기", role: "파이썬 스터디원", tag: "스터디" },
    { id: 3, title: "해커톤 같이 나가실 디자이너 모십니다", role: "UI/UX 디자이너", tag: "프로젝트" },
  ], []);

  const [contests, setContests] = useState<HomeContest[]>(dummyContests);
  const [teams, setTeams] = useState<HomeTeam[]>(dummyTeams);

  useEffect(() => {
    apiGet<{ contests: HomeContest[] }>("/api/contests?limit=4")
      .then((data) => setContests(data.contests))
      .catch(() => setContests(dummyContests));

    apiGet<{ teamProfiles: Array<{ id: number; role: string; lookingFor: string }> }>("/api/team-profiles?limit=3")
      .then((data) => {
        setTeams(data.teamProfiles.map((profile) => ({
          id: profile.id,
          title: profile.lookingFor || "함께 성장할 팀원을 찾고 있어요",
          role: profile.role,
          tag: "팀 매칭",
        })));
      })
      .catch(() => setTeams(dummyTeams));
  }, [dummyContests, dummyTeams]);

  return (
    <div className="space-y-8 pb-10">
      <section className="relative min-h-[340px] overflow-hidden rounded-lg bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-10">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="relative flex min-h-[280px] max-w-2xl flex-col justify-center">
          <Badge className="mb-4 w-fit border-white/20 bg-white/15 text-white hover:bg-white/15">
            대학생 커리어 매칭
          </Badge>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            UniLink
          </h1>
          <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/86 sm:text-lg">
            공모전, 스터디, 팀 매칭을 한 화면에서 찾고 AI로 다음 활동을 좁혀보세요.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
              <Link to="/onboarding">
                내 스펙 등록
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/ai-matching">AI 추천 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-900">{item.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
            </Link>
          );
        })}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-blue-600">실시간 업데이트</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">인기 공모전</h2>
            </div>
            <Button asChild variant="ghost" className="text-blue-700">
              <Link to="/recommendation">
                더보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {contests.map((item) => (
              <Link
                to="/recommendation"
                key={item.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl ?? item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className="absolute left-3 top-3 bg-blue-600 text-white hover:bg-blue-600">
                    {item.dDay}
                  </Badge>
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-slate-950 group-hover:text-blue-700">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="line-clamp-1">{item.organizer ?? "주최기관"}</span>
                    <span>{item.viewLabel ?? item.views} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div>
            <p className="text-sm font-bold text-emerald-600">커뮤니티</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">새 팀원 모집</h2>
          </div>

          <div className="space-y-3">
            {teams.map((team) => (
              <Card key={team.id} className="transition-colors hover:border-blue-200">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      {team.tag}
                    </Badge>
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{team.title}</h3>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {team.role} 구함
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link
            to="/schedule"
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
          >
            <CalendarDays className="h-5 w-5 text-blue-600" />
            오늘의 멘토링 일정 확인
          </Link>
        </aside>
      </section>
    </div>
  );
}
