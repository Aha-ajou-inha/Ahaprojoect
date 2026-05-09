import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  Coins,
  MapPin,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiGet } from "@/lib/api";
import {
  getAttendanceReward,
  getCoinsUntilNextLevel,
  getGrowthLevel,
  getGrowthProgress,
  getNextGrowthLevel,
  Mapjiri,
  userRoadInStats,
} from "@/lib/roadin";

type HomeContest = {
  id: number;
  title: string;
  dDay: string;
  views: string | number;
  viewLabel?: string;
  image: string;
  imageUrl?: string;
  organizer?: string;
  category?: string;
};

type HomeTeam = {
  id: number;
  title: string;
  role: string;
  tag: string;
  match?: number;
  university?: string;
};

const mapCases = [
  {
    title: "스터디 모집",
    mobileTitle: "스터디",
    location: "강남역",
    initials: "민",
    tone: "bg-blue-600",
    className: "left-[14%] top-[15%]",
  },
  {
    title: "프로젝트 팀원 모집",
    mobileTitle: "프로젝트",
    location: "홍대입구역",
    initials: "준",
    tone: "bg-sky-600",
    className: "right-[9%] top-[9%]",
  },
  {
    title: "IT 연합 동아리",
    mobileTitle: "동아리",
    location: "건국대",
    initials: "서",
    tone: "bg-violet-600",
    className: "left-[10%] bottom-[18%]",
  },
  {
    title: "공모전 팀원 모집",
    mobileTitle: "공모전팀",
    location: "서울대입구역",
    initials: "하",
    tone: "bg-emerald-600",
    className: "right-[10%] bottom-[19%]",
  },
];

const nearbyRoads = [
  { title: "공공데이터 공모전 팀", place: "서울대입구", type: "공모전", distance: "1.2km", icon: Trophy },
  { title: "React 밤샘 스터디", place: "강남역", type: "스터디", distance: "2.4km", icon: BookOpenCheck },
  { title: "제품 기획 사이드 프로젝트", place: "홍대입구", type: "프로젝트", distance: "3.1km", icon: Users },
];

const mapDots = [
  "left-[39%] top-[38%] bg-blue-500",
  "left-[58%] top-[49%] bg-blue-500",
  "left-[64%] top-[31%] bg-blue-500",
  "right-[19%] top-[42%] bg-teal-500",
  "right-[10%] top-[28%] bg-teal-500",
];

export function Home() {
  const dummyContests = useMemo<HomeContest[]>(() => [
    {
      id: 1,
      title: "2026년 트래블 이노베이션 아이디어 공모전",
      dDay: "D-61",
      views: "1,946",
      organizer: "야놀자 Research",
      category: "서비스 기획",
      image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      id: 2,
      title: "제5회 고용노동 공공데이터·AI 활용 공모전",
      dDay: "D-5",
      views: "2,995",
      organizer: "고용노동부",
      category: "데이터 AI",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      id: 3,
      title: "[넥슨] 메이플스토리 해커톤, 2026 메커톤",
      dDay: "D-2",
      views: "1,822",
      organizer: "넥슨 코리아",
      category: "해커톤",
      image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=400&h=400",
    },
  ], []);

  const dummyTeams = useMemo<HomeTeam[]>(() => [
    {
      id: 1,
      title: "IT 서비스 창업 동아리 SOPT 신규 파트너 모집",
      role: "프론트엔드 1명",
      tag: "동아리",
      match: 94,
      university: "연합",
    },
    {
      id: 2,
      title: "공공데이터 공모전 대시보드 팀 빌딩",
      role: "데이터 분석 1명",
      tag: "공모전",
      match: 89,
      university: "서울권",
    },
    {
      id: 3,
      title: "해커톤 같이 나갈 UI/UX 디자이너 모십니다",
      role: "디자이너 1명",
      tag: "프로젝트",
      match: 86,
      university: "건국대",
    },
  ], []);

  const [contests, setContests] = useState<HomeContest[]>(dummyContests);
  const [teams, setTeams] = useState<HomeTeam[]>(dummyTeams);

  const currentLevel = getGrowthLevel(userRoadInStats.coins);
  const nextLevel = getNextGrowthLevel(userRoadInStats.coins);
  const coinsUntilNext = getCoinsUntilNextLevel(userRoadInStats.coins);
  const progress = getGrowthProgress(userRoadInStats.coins);
  const attendanceReward = getAttendanceReward(userRoadInStats.attendanceWeeks);

  useEffect(() => {
    apiGet<{ contests: HomeContest[] }>("/api/contests?limit=3")
      .then((data) => setContests(data.contests))
      .catch(() => setContests(dummyContests));

    apiGet<{ teamProfiles: Array<{ id: number; role: string; lookingFor: string; university?: string }> }>("/api/team-profiles?limit=3")
      .then((data) => {
        setTeams(data.teamProfiles.map((profile, index) => ({
          id: profile.id,
          title: profile.lookingFor || "함께 성장할 팀원을 찾고 있어요",
          role: profile.role,
          tag: "AI 팀추천",
          match: 94 - index * 4,
          university: profile.university ?? "캠퍼스",
        })));
      })
      .catch(() => setTeams(dummyTeams));
  }, [dummyContests, dummyTeams]);

  return (
    <div className="space-y-7 pb-10">
      <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
        <div className="grid lg:min-h-[310px] lg:grid-cols-[0.9fr_1.35fr]">
          <div className="relative z-10 flex min-h-[245px] flex-col justify-between gap-5 px-6 py-6 sm:px-8 lg:min-h-[310px]">
            <div>
              <Badge className="mb-3 w-fit bg-blue-50 text-blue-700 hover:bg-blue-50">
                map-based campus community
              </Badge>
              <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Road-In
              </h1>
              <p className="mt-3 max-w-md text-sm font-bold leading-6 text-slate-500 sm:text-base">
                최종 목적지를 향해 지도 위를 이동하며 성장하는 대학생들의 캠퍼스 성장 지도입니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button asChild className="h-10 bg-blue-600 px-4 text-sm text-white hover:bg-blue-700">
                <Link to="/onboarding">
                  내 스펙 등록
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 border-blue-200 bg-white px-4 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                <Link to="/ai-matching">
                  AI 추천 보기
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[250px] overflow-hidden border-t border-blue-100 bg-slate-50 lg:min-h-[310px] lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_0_18%,rgba(148,163,184,0.34)_19%,rgba(148,163,184,0.34)_20%,transparent_21%_100%),linear-gradient(146deg,transparent_0_26%,rgba(148,163,184,0.3)_27%,rgba(148,163,184,0.3)_28%,transparent_29%_100%),linear-gradient(84deg,transparent_0_44%,rgba(148,163,184,0.26)_45%,rgba(148,163,184,0.26)_46%,transparent_47%_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(191,219,254,0.58),transparent_18%),radial-gradient(circle_at_76%_22%,rgba(186,230,253,0.55),transparent_18%),radial-gradient(circle_at_69%_76%,rgba(187,247,208,0.42),transparent_20%),radial-gradient(circle_at_32%_78%,rgba(254,240,138,0.34),transparent_16%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.22)_42%,rgba(255,255,255,0)_100%)]" />
            <div className="absolute left-[43%] top-[40%] hidden h-px w-[21%] rotate-[-16deg] bg-blue-300/80 sm:block" />
            <div className="absolute left-[55%] top-[45%] hidden h-px w-[25%] rotate-[18deg] bg-blue-300/80 sm:block" />
            <div className="absolute right-[15%] top-[35%] hidden h-px w-[17%] rotate-[-8deg] bg-emerald-300/80 sm:block" />

            <div className="absolute bottom-4 left-4 hidden items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-black text-blue-700 shadow-sm sm:flex">
              <Mapjiri level={currentLevel.level} className="h-10 w-10 scale-50" />
              맵지리가 목적지까지 안내 중
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-2 px-4 py-4 sm:hidden">
              {mapCases.map((item) => (
                <div
                  key={item.title}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-white/80 bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow-sm ${item.tone}`}>
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black leading-4 text-slate-950">{item.mobileTitle}</p>
                    <p className="text-[11px] font-bold text-slate-500">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {mapDots.map((dot) => (
              <span
                key={dot}
                className={`absolute hidden h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm sm:block ${dot}`}
              />
            ))}

            {mapCases.map((item) => (
              <div
                key={item.title}
                className={`absolute hidden min-w-[158px] items-center gap-3 rounded-lg border border-white/80 bg-white/90 px-3 py-2.5 shadow-lg shadow-slate-200/80 backdrop-blur sm:flex ${item.className}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white text-sm font-black text-white shadow-sm ${item.tone}`}>
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-black leading-5 text-slate-950">{item.title}</p>
                  <p className="text-xs font-bold text-slate-500">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-6">
          <section className="space-y-4">
            <div>
              <p className="text-sm font-black text-blue-600">주변 로드</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">지도 위 주변 모집과 스터디</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {nearbyRoads.map((road) => {
                const Icon = road.icon;

                return (
                  <Card key={road.title} className="overflow-hidden border-blue-100">
                    <CardContent className="relative p-4">
                      <div className="absolute inset-0 bg-[linear-gradient(34deg,transparent_0_44%,rgba(147,197,253,0.35)_45%,rgba(147,197,253,0.35)_47%,transparent_48%_100%)]" />
                      <div className="relative">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge variant="secondary" className="bg-white text-slate-600">
                            {road.distance}
                          </Badge>
                        </div>
                        <Badge className="mb-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                          {road.type}
                        </Badge>
                        <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{road.title}</h3>
                        <p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {road.place}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black text-blue-600">AI 추천</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">내 로드에 맞는 공모전</h2>
              </div>
              <Button asChild variant="ghost" className="shrink-0 text-blue-700">
                <Link to="/recommendation">
                  더보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {contests.map((item, index) => (
                <Link
                  to="/recommendation"
                  key={item.id}
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl ?? item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute left-3 top-3 bg-blue-600 text-white hover:bg-blue-600">
                      {item.dDay}
                    </Badge>
                    <div className="absolute bottom-3 right-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-black text-blue-700 shadow-sm">
                      매칭 {96 - index * 4}%
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {item.category ?? "AI 추천"}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">{item.viewLabel ?? item.views} views</span>
                    </div>
                    <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-slate-950 group-hover:text-blue-700">
                      {item.title}
                    </h3>
                    <p className="line-clamp-1 text-xs font-bold text-slate-500">{item.organizer ?? "주최기관"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black text-emerald-600">AI 팀추천</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">함께하면 좋을 팀</h2>
              </div>
              <Button asChild variant="ghost" className="shrink-0 text-emerald-700">
                <Link to="/recruitment">
                  모집 더보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  to="/recruitment"
                  className="group flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                          {team.tag}
                        </Badge>
                        <span className="text-xs font-bold text-slate-400">{team.university ?? "캠퍼스"}</span>
                      </div>
                      <h3 className="line-clamp-1 text-sm font-black text-slate-950 group-hover:text-emerald-700">
                        {team.title}
                      </h3>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {team.role} 구함
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-slate-400">팀 적합도</p>
                    <p className="text-xl font-black text-emerald-600">{team.match ?? 88}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[7.5rem] lg:self-start">
          <Card className="overflow-hidden border-blue-100 shadow-sm">
            <CardContent className="p-0">
              <div className="bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.28),transparent_38%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-5 py-6">
                <div className="flex items-center gap-4">
                  <Mapjiri level={currentLevel.level} className="h-24 w-24 shrink-0" />
                  <div className="min-w-0">
                    <Badge className={`mb-2 ${currentLevel.tone}`}>
                      Lv.{currentLevel.level} {currentLevel.name}
                    </Badge>
                    <h2 className="text-2xl font-black text-slate-950">{userRoadInStats.name}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-500">{userRoadInStats.career}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <Coins className="mb-2 h-4 w-4 text-amber-500" />
                    <p className="text-xs font-bold text-slate-500">코인</p>
                    <p className="text-lg font-black text-slate-950">{userRoadInStats.coins}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <Bike className="mb-2 h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-500">등급</p>
                    <p className="text-lg font-black text-slate-950">{currentLevel.name}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <Target className="mb-2 h-4 w-4 text-blue-600" />
                    <p className="text-xs font-bold text-slate-500">대관 할인</p>
                    <p className="text-lg font-black text-slate-950">{currentLevel.discount}%</p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-black">
                    <span className="text-slate-700">{nextLevel ? `다음 등급 Lv.${nextLevel.level} ${nextLevel.name}` : "최고 등급 도착"}</span>
                    <span className="text-blue-700">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-blue-100" />
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {nextLevel ? `${coinsUntilNext}코인을 더 모으면 ${nextLevel.transport}로 이동합니다.` : "맵지리가 우주까지 도착했어요."}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-950">연속 출석 보상</h3>
                    <CalendarCheck2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500">로드미션 완료 시 출석 인정 · {userRoadInStats.attendanceWeeks}주 연속</p>
                      <p className="mt-1 text-xl font-black text-blue-700">+{attendanceReward}코인 수령 가능</p>
                    </div>
                    <Badge variant="secondary" className="bg-white text-blue-700">
                      3주차 +6
                    </Badge>
                  </div>
                  <Progress value={userRoadInStats.attendanceProgress} className="mt-3 h-2 bg-white" />
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-950">오늘의 로드 미션</h3>
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 text-sm font-bold text-slate-700">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      관심 공모전 1개 저장
                    </div>
                    <Progress value={67} className="h-2 bg-white" />
                    <p className="mt-2 text-xs text-slate-500">이 로드미션을 완료해야 오늘 출석으로 인정됩니다. 완료 시 +1코인.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
