import { useState } from "react";
import {
  BookOpen, Calendar, ChevronLeft, ChevronRight, GraduationCap,
  MapPin, PencilLine, Search, Star, Trophy, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tab = "study" | "contest" | "seminar";

// ───── 스터디 데이터 ─────
type StudyItem = {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  desc: string;
  tags: string[];
  maxMembers: number;
  currentMembers: number;
  time: string;
  emoji: string;
};

const STUDIES: StudyItem[] = [
  { id: 1, category: "수학/통계", categoryColor: "bg-orange-100 text-orange-600", title: "수학 공부 할 사람!", desc: "미적분, 선형대수 같이 공부해요\n기초부터 문제풀이까지 함께!", tags: ["수학", "미적분"], maxMembers: 5, currentMembers: 3, time: "", emoji: "📒" },
  { id: 2, category: "프로그래밍", categoryColor: "bg-green-100 text-green-600", title: "코딩 스터디 (Python)", desc: "파이썬 기초부터 프로젝트까지!\n함께 성장해요 🚀", tags: ["Python", "코딩"], maxMembers: 6, currentMembers: 4, time: "", emoji: "💻" },
  { id: 3, category: "토익/어학", categoryColor: "bg-blue-100 text-blue-600", title: "토익 900+ 목표 스터디", desc: "주 3회 모의고사 진행!\n같이 900+ 도전해요 💪", tags: ["토익", "영어"], maxMembers: 4, currentMembers: 2, time: "", emoji: "📘" },
  { id: 4, category: "자격증", categoryColor: "bg-yellow-100 text-yellow-700", title: "컴활 1급 스터디", desc: "컴퓨터활용능력 1급 합격을 위한\n이론 + 기출 풀이가 진행!", tags: ["컴활", "자격증"], maxMembers: 5, currentMembers: 1, time: "", emoji: "📊" },
  { id: 5, category: "전공/전문", categoryColor: "bg-purple-100 text-purple-600", title: "경영학 전공스터디", desc: "경영학 개념 정리 및 사례 분석\n함께 해요!", tags: ["경영학", "전공"], maxMembers: 6, currentMembers: 3, time: "", emoji: "📈" },
  { id: 6, category: "취업/면접", categoryColor: "bg-red-100 text-red-600", title: "면접 스터디 (실전 모의면접)", desc: "면접 질문 공유 및 피드백!\n실전처럼 연습해요 🎯", tags: ["면접", "취업"], maxMembers: 4, currentMembers: 2, time: "", emoji: "📋" },
];

// ───── 공모전 데이터 ─────
type ContestItem = {
  id: number;
  level: number;
  levelName: string;
  levelColor: string;
  category: string;
  categoryColor: string;
  title: string;
  desc: string;
  tags: string[];
  maxMembers: number;
  currentMembers: number;
  time: string;
};

const CONTESTS: ContestItem[] = [
  { id: 1, level: 5, levelName: "우주대장", levelColor: "bg-violet-600", category: "기획/아이디어", categoryColor: "text-violet-600 bg-violet-50", title: "2025 환경 아이디어 공모전 함께 도전할 팀원 구합니다!", desc: "환경 문제 해결 아이디어를 가진 분을 환영해요! 함께 의미 있는 도전해요 🌱", tags: ["팀원모집", "아이디어", "환경"], maxMembers: 4, currentMembers: 2, time: "2시간 전" },
  { id: 2, level: 3, levelName: "따릉이", levelColor: "bg-green-500", category: "영상/디자인", categoryColor: "text-pink-600 bg-pink-50", title: "공익광고 공모전 같이 준비하실 분 찾습니다!", desc: "영상 편집 가능하신 분, 아이디어 좋으신 분 함께해요! 수상 경험 있어요 🏆", tags: ["공익광고", "영상", "팀원모집"], maxMembers: 3, currentMembers: 1, time: "3시간 전" },
  { id: 3, level: 4, levelName: "붕붕이", levelColor: "bg-amber-500", category: "논문/리포트", categoryColor: "text-blue-600 bg-blue-50", title: "빅데이터 활용 공모전 같이 나가실 분 모집해요!", desc: "데이터 분석, 시각화에 관심 있는 분 연락주세요! Python 가능자 우대 😊", tags: ["빅데이터", "분석", "Python"], maxMembers: 5, currentMembers: 3, time: "5시간 전" },
  { id: 4, level: 6, levelName: "우주최강", levelColor: "bg-violet-800", category: "IT/개발", categoryColor: "text-cyan-600 bg-cyan-50", title: "앱 서비스 개발 공모전 함께할 개발자 구해요!", desc: "프론트, 백엔드 모두 구해요! 아이디어 기획은 준비되어 있어 🚀", tags: ["앱개발", "개발자", "팀프로젝트"], maxMembers: 4, currentMembers: 2, time: "6시간 전" },
  { id: 5, level: 2, levelName: "씽씽이", levelColor: "bg-blue-500", category: "마케팅/브랜딩", categoryColor: "text-orange-600 bg-orange-50", title: "브랜드 마케팅 공모전 같이 준비할 분!", desc: "마케팅 아이디어, SNS 운영 경험 있으신 분 환영합니다! 재밌게 도전해요 ✨", tags: ["마케팅", "SNS", "브랜드"], maxMembers: 3, currentMembers: 1, time: "7시간 전" },
  { id: 6, level: 3, levelName: "따릉이", levelColor: "bg-green-500", category: "디자인", categoryColor: "text-teal-600 bg-teal-50", title: "포스터 디자인 공모전 팀원 모집합니다!", desc: "포스터 디자인 잘하시는 분! 아이디어 구상 같이 해요 🍊", tags: ["포스터", "디자인", "팀원구함"], maxMembers: 2, currentMembers: 0, time: "8시간 전" },
];

// ───── 세미나 데이터 ─────
type SeminarItem = {
  id: number;
  level: number;
  levelName: string;
  levelColor: string;
  category: string;
  categoryColor: string;
  title: string;
  desc: string;
  tags: string[];
  date: string;
  location: string;
  audienceMax: number;
  audienceLeft: number;
  seminarMax: number;
  seminarLeft: number;
  time: string;
};

const SEMINARS: SeminarItem[] = [
  { id: 1, level: 2, levelName: "씽씽이", levelColor: "bg-green-500", category: "데이터/분석", categoryColor: "text-green-600 bg-green-50", title: "데이터 분석 실무 기초 세미나", desc: "데이터 분석 기초부터 실무 활용 사례까지!", tags: ["데이터분석", "엑셀", "파이썬"], date: "2025.06.15 (일) 14:00", location: "서울 강남역 인근", audienceMax: 30, audienceLeft: 12, seminarMax: 10, seminarLeft: 5, time: "2시간 전" },
  { id: 2, level: 4, levelName: "붕붕이", levelColor: "bg-amber-500", category: "마케팅/브랜딩", categoryColor: "text-orange-600 bg-orange-50", title: "브랜드 마케팅 실전 전략 세미나", desc: "브랜드 성장을 위한 마케팅 전략과 실제 사례를 공유해요!", tags: ["마케팅", "브랜드", "SNS"], date: "2025.06.20 (금) 19:00", location: "온라인 (Zoom)", audienceMax: 40, audienceLeft: 18, seminarMax: 15, seminarLeft: 7, time: "5시간 전" },
  { id: 3, level: 5, levelName: "우주대장", levelColor: "bg-violet-600", category: "IT/개발", categoryColor: "text-cyan-600 bg-cyan-50", title: "ChatGPT로 업무 자동화하기 세미나", desc: "ChatGPT 활용법부터 자동화 도구 연동까지!", tags: ["AI", "ChatGPT", "업무자동화"], date: "2025.06.22 (일) 16:00", location: "서울역 IT센터 3층", audienceMax: 50, audienceLeft: 20, seminarMax: 20, seminarLeft: 10, time: "1일 전" },
];

const STUDY_EMOJI_BG: Record<string, string> = {
  "📒": "bg-orange-50", "💻": "bg-slate-50", "📘": "bg-blue-50",
  "📊": "bg-yellow-50", "📈": "bg-purple-50", "📋": "bg-red-50",
};

const PAGE_SIZE_STUDY = 6;
const PAGE_SIZE_CONTEST = 6;
const PAGE_SIZE_SEMINAR = 3;

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button onClick={() => onChange(Math.max(1, page - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn("flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
            p === page ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Recruitment() {
  const [activeTab, setActiveTab] = useState<Tab>("study");
  const [query, setQuery] = useState("");
  const [studyPage, setStudyPage] = useState(1);
  const [contestPage, setContestPage] = useState(1);
  const [seminarPage, setSeminarPage] = useState(1);
  const [starred, setStarred] = useState<Set<string>>(new Set());

  function toggleStar(key: string) {
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const filteredStudies = STUDIES.filter((s) =>
    `${s.title} ${s.desc} ${s.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  );
  const filteredContests = CONTESTS.filter((c) =>
    `${c.title} ${c.desc} ${c.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  );
  const filteredSeminars = SEMINARS.filter((s) =>
    `${s.title} ${s.desc} ${s.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  );

  const pagedStudies = filteredStudies.slice((studyPage - 1) * PAGE_SIZE_STUDY, studyPage * PAGE_SIZE_STUDY);
  const pagedContests = filteredContests.slice((contestPage - 1) * PAGE_SIZE_CONTEST, contestPage * PAGE_SIZE_CONTEST);
  const pagedSeminars = filteredSeminars.slice((seminarPage - 1) * PAGE_SIZE_SEMINAR, seminarPage * PAGE_SIZE_SEMINAR);

  const tabs = [
    { key: "study" as Tab, label: "스터디", sub: "함께 공부하고 성장해요!", icon: BookOpen },
    { key: "contest" as Tab, label: "공모전", sub: "같이 도전하고 수상을 노려요!", icon: Trophy },
    { key: "seminar" as Tab, label: "세미나", sub: "함께 배우고 인사이트를 얻어요!", icon: GraduationCap },
  ];

  const searchPlaceholders: Record<Tab, string> = {
    study: "스터디 제목을 검색하세요",
    contest: "공모전 제목이나 키워드를 검색하세요",
    seminar: "세미나 제목이나 키워드를 검색하세요",
  };

  const writeLabels: Record<Tab, string> = {
    study: "스터디 등록하기",
    contest: "모집글 작성하기",
    seminar: "세미나 글 작성하기",
  };

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-black text-slate-900">모집</h1>

      {/* 탭 */}
      <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setQuery(""); }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-5 transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span className="text-base font-black">{tab.label}</span>
              </div>
              <span className={cn("text-xs font-medium", isActive ? "text-blue-100" : "text-slate-400")}>{tab.sub}</span>
            </button>
          );
        })}
      </div>

      {/* 검색 + 필터 + 작성 버튼 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholders[activeTab]}
            className="h-11 rounded-xl border-slate-200 pl-9"
          />
        </div>
        <select className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
          <option>전체 분야</option>
        </select>
        {activeTab !== "study" && (
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
            <option>모집 방식</option>
          </select>
        )}
        {activeTab !== "study" && (
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
            <option>진행 상태</option>
          </select>
        )}
        <select className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
          <option>최신순</option>
        </select>
        <Button className="h-11 rounded-xl bg-blue-600 px-5 font-bold hover:bg-blue-700">
          <PencilLine className="h-4 w-4" />
          {writeLabels[activeTab]}
        </Button>
      </div>

      {/* ── 스터디 탭 ── */}
      {activeTab === "study" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagedStudies.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className={cn("rounded-full px-3 py-1 text-xs font-bold", item.categoryColor)}>{item.category}</span>
                  <button onClick={() => toggleStar(`study-${item.id}`)} className="text-slate-300 hover:text-yellow-400">
                    <Star className={cn("h-5 w-5", starred.has(`study-${item.id}`) ? "fill-yellow-400 text-yellow-400" : "")} />
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-4">
                  <div className={cn("flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-4xl", STUDY_EMOJI_BG[item.emoji] ?? "bg-slate-50")}>
                    {item.emoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black leading-snug text-slate-900 line-clamp-2">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 whitespace-pre-line line-clamp-2">{item.desc}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">#{tag}</span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>모집인원 <strong>{item.maxMembers}명</strong></span>
                    <span>신청 <strong>{item.currentMembers}명</strong></span>
                  </div>
                  <Button className="h-8 rounded-xl bg-blue-600 px-4 text-sm font-bold hover:bg-blue-700">신청하기</Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={studyPage} total={filteredStudies.length} perPage={PAGE_SIZE_STUDY} onChange={setStudyPage} />
        </>
      )}

      {/* ── 공모전 탭 ── */}
      {activeTab === "contest" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {pagedContests.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                {/* 레벨 이미지 */}
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <img src={`/step${Math.min(item.level, 5)}.png`} alt={item.levelName} className="h-20 w-20 object-contain" />
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-black text-white", item.levelColor)}>
                    Lv.{item.level} {item.levelName}
                  </span>
                </div>

                {/* 내용 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", item.categoryColor)}>{item.category}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                      <span>{item.time}</span>
                      <button onClick={() => toggleStar(`contest-${item.id}`)}>
                        <Star className={cn("h-4 w-4", starred.has(`contest-${item.id}`) ? "fill-yellow-400 text-yellow-400" : "text-slate-300 hover:text-yellow-400")} />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-2 text-base font-black leading-snug text-slate-900 line-clamp-2">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{item.desc}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">#{tag}</span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-3 text-sm text-slate-600">
                      <span>모집인원 <strong>{item.maxMembers}명</strong></span>
                      <span>신청 <strong>{item.currentMembers}명</strong></span>
                    </div>
                    <Button className="h-8 rounded-xl bg-blue-50 px-4 text-sm font-bold text-blue-600 hover:bg-blue-100 shadow-none border border-blue-100">신청하기</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={contestPage} total={filteredContests.length} perPage={PAGE_SIZE_CONTEST} onChange={setContestPage} />
        </>
      )}

      {/* ── 세미나 탭 ── */}
      {activeTab === "seminar" && (
        <>
          <div className="space-y-4">
            {pagedSeminars.map((item) => (
              <div key={item.id} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                {/* 좌측 */}
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <img src={`/step${Math.min(item.level, 5)}.png`} alt={item.levelName} className="h-24 w-24 object-contain" />
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-black text-white", item.levelColor)}>
                    Lv.{item.level} {item.levelName}
                  </span>
                </div>

                {/* 중앙 - 내용 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", item.categoryColor)}>{item.category}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                      <span>{item.time}</span>
                      <button onClick={() => toggleStar(`seminar-${item.id}`)}>
                        <Star className={cn("h-4 w-4", starred.has(`seminar-${item.id}`) ? "fill-yellow-400 text-yellow-400" : "text-slate-300 hover:text-yellow-400")} />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-2 text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">#{tag}</span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" />{item.date}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{item.location}</span>
                  </div>
                </div>

                {/* 우측 - 참여 버튼 2개 */}
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  {/* 청객 참여 */}
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 min-w-[130px] shadow-sm">
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                      <Users className="h-4 w-4 text-blue-500" />
                      청객 참여
                    </div>
                    <p className="text-xs text-slate-400">참가 인원으로 참여해요!</p>
                    <p className="text-lg font-black text-green-500">{item.audienceLeft}명 남음 / {item.audienceMax}명</p>
                    <Button className="w-full rounded-xl bg-green-500 font-bold hover:bg-green-600">청객 참여</Button>
                  </div>

                  {/* 세미나 참여 */}
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 min-w-[130px] shadow-sm">
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                      <Users className="h-4 w-4 text-blue-600" />
                      세미나 참여
                    </div>
                    <p className="text-xs text-slate-400">함께 기획/운영에 참여해요!</p>
                    <p className="text-lg font-black text-blue-600">{item.seminarLeft}명 남음 / {item.seminarMax}명</p>
                    <Button className="w-full rounded-xl bg-blue-600 font-bold hover:bg-blue-700">세미나 참여</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={seminarPage} total={filteredSeminars.length} perPage={PAGE_SIZE_SEMINAR} onChange={setSeminarPage} />
        </>
      )}
    </div>
  );
}
