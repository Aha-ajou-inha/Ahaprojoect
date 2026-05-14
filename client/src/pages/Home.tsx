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
    location: "아주대학교",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80",
    cx: 20, cy: 46,
  },
  {
    title: "프로젝트 팀원 모집",
    location: "광교 테크노밸리",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80",
    cx: 62, cy: 36,
  },
  {
    title: "IT 연합 동아리",
    location: "수원역",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80&h=80",
    cx: 24, cy: 78,
  },
  {
    title: "공모전 팀원 모집",
    location: "인천 송도",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80",
    cx: 68, cy: 74,
  },
];

const nearbyRoads = [
  { title: "공공데이터 공모전 팀", place: "아주대학교", type: "공모전", distance: "0.3km", icon: Trophy },
  { title: "React 밤샘 스터디", place: "광교 테크노밸리", type: "스터디", distance: "1.2km", icon: BookOpenCheck },
  { title: "제품 기획 사이드 프로젝트", place: "수원역", type: "프로젝트", distance: "2.4km", icon: Users },
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
                Mapjiri
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

          <div className="relative min-h-[250px] overflow-hidden border-t border-blue-100 lg:min-h-[310px] lg:border-l lg:border-t-0">
            {/* 지도 스타일 배경 (SVG 도로망) */}
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              {/* 배경 */}
              <rect width="100%" height="100%" fill="#eef2f7" />
              {/* 블록들 */}
              <rect x="0" y="0" width="38%" height="42%" fill="#e8edf4" />
              <rect x="42%" y="0" width="30%" height="35%" fill="#e8edf4" />
              <rect x="75%" y="0" width="25%" height="55%" fill="#e8edf4" />
              <rect x="0" y="50%" width="28%" height="50%" fill="#e8edf4" />
              <rect x="32%" y="55%" width="35%" height="45%" fill="#e8edf4" />
              <rect x="72%" y="60%" width="28%" height="40%" fill="#e8edf4" />
              {/* 주요 도로 (굵은 선) */}
              <line x1="0" y1="42%" x2="100%" y2="42%" stroke="#d4d9e3" strokeWidth="8" />
              <line x1="38%" y1="0" x2="38%" y2="100%" stroke="#d4d9e3" strokeWidth="8" />
              <line x1="72%" y1="0" x2="72%" y2="100%" stroke="#d4d9e3" strokeWidth="6" />
              <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#d4d9e3" strokeWidth="6" />
              {/* 보조 도로 */}
              <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#dde2ec" strokeWidth="3" />
              <line x1="55%" y1="0" x2="55%" y2="100%" stroke="#dde2ec" strokeWidth="3" />
              <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#dde2ec" strokeWidth="3" />
              <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#dde2ec" strokeWidth="3" />
              <line x1="0" y1="58%" x2="100%" y2="58%" stroke="#dde2ec" strokeWidth="3" />
              <line x1="0" y1="85%" x2="100%" y2="85%" stroke="#dde2ec" strokeWidth="3" />
              {/* 공원/녹지 */}
              <rect x="40%" y="44%" width="10%" height="12%" rx="4" fill="#d1e8d0" opacity="0.7" />
              <rect x="16%" y="22%" width="8%" height="18%" rx="3" fill="#d1e8d0" opacity="0.6" />
              <rect x="73%" y="44%" width="11%" height="14%" rx="4" fill="#d1e8d0" opacity="0.6" />
              {/* 연결 점선 (핀 사이) */}
              <line x1="20%" y1="46%" x2="62%" y2="36%" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
              <line x1="20%" y1="46%" x2="24%" y2="78%" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
              <line x1="62%" y1="36%" x2="68%" y2="74%" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
              <line x1="24%" y1="78%" x2="68%" y2="74%" stroke="#5eead4" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
              {/* 핀 점 */}
              <circle cx="20%" cy="46%" r="6" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
              <circle cx="62%" cy="36%" r="6" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
              <circle cx="24%" cy="78%" r="6" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
              <circle cx="68%" cy="74%" r="6" fill="white" stroke="#14b8a6" strokeWidth="2.5" />
              {/* 작은 점들 */}
              <circle cx="42%" cy="37%" r="4" fill="#60a5fa" opacity="0.7" />
              <circle cx="53%" cy="48%" r="4" fill="#60a5fa" opacity="0.7" />
              <circle cx="78%" cy="35%" r="4" fill="#2dd4bf" opacity="0.7" />
              <circle cx="86%" cy="52%" r="4" fill="#2dd4bf" opacity="0.7" />
            </svg>

            {/* 맵지리 안내 뱃지 */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-black text-blue-700 shadow-md">
              <Mapjiri level={currentLevel.level} className="h-7 w-7" />
              맵지리가 목적지까지 안내 중
            </div>

            {/* 핀 카드 — 프로필 사진 + 제목 + 위치 */}
            {mapCases.map((item) => (
              <div
                key={item.title}
                className="absolute z-10 flex items-center gap-2.5 rounded-2xl bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm"
                style={{ left: `${item.cx}%`, top: `${item.cy}%`, transform: "translate(-10%, -140%)" }}
              >
                <img
                  src={item.avatar}
                  alt={item.title}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-[13px] font-black text-slate-900">{item.title}</p>
                  <p className="flex items-center gap-0.5 text-[11px] font-bold text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0" />{item.location}
                  </p>
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
                    <p className="mt-1 truncate text-sm font-bold text-slate-500" title={userRoadInStats.career}>{userRoadInStats.career}</p>
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
                      <p className="truncate text-xs font-bold text-slate-500" title={`로드미션 완료 시 출석 인정 · ${userRoadInStats.attendanceWeeks}주 연속`}>로드미션 완료 시 출석 인정 · {userRoadInStats.attendanceWeeks}주 연속</p>
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
