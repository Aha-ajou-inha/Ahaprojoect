import { useState } from "react";
import { Bot, ChevronDown, Coins, Heart, Search, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tab = "contest" | "seminar";

// ───── 공모전 데이터 ─────
type ContestItem = {
  id: number;
  title: string;
  desc: string;
  organizer: string;
  dDay: string;
  deadline: string;
  tags: string[];
  image: string;
  aiReason: string;
};

const CONTESTS: ContestItem[] = [
  {
    id: 1,
    title: "2026 AI 아이디어 챌린지",
    desc: "인공지능 기술을 활용한 창의적 아이디어를 찾습니다!",
    organizer: "한국지능정보사회진흥원 (NIA)",
    dDay: "D-14",
    deadline: "2026.05.25",
    tags: ["인공지능", "아이디어"],
    image: "https://picsum.photos/seed/ai-contest/400/220",
    aiReason: "AI 기술 활용 경쟁이 많은 공모전일 가능성이 높아요!",
  },
  {
    id: 2,
    title: "제13회 대학생 데이터 분석 공모전",
    desc: "공공·민간 데이터를 활용한 분석 과제를 수행해보세요!",
    organizer: "통계청 · 한국산업기술진흥원",
    dDay: "D-22",
    deadline: "2026.06.01",
    tags: ["데이터", "분석"],
    image: "https://picsum.photos/seed/data-analysis/400/220",
    aiReason: "데이터 분석에 대한 관심이 높은 당신에게 추천해요!",
  },
  {
    id: 3,
    title: "2026 대학생 스타트업 아이디어 공모전",
    desc: "세상을 바꿀 창업 아이디어를 제안해보세요!",
    organizer: "중소벤처기업부",
    dDay: "D-29",
    deadline: "2026.06.08",
    tags: ["창업", "아이디어"],
    image: "https://picsum.photos/seed/startup/400/220",
    aiReason: "창업과 아이디어 분야에 관심 있는 당신에게 추천해요!",
  },
  {
    id: 4,
    title: "2026 UX/UI 서비스 기획 공모전",
    desc: "사용자 중심의 혁신적인 서비스 아이디어를 기다립니다!",
    organizer: "한국디자인진흥원 (kidp)",
    dDay: "D-36",
    deadline: "2026.06.15",
    tags: ["UX/UI", "기획"],
    image: "https://picsum.photos/seed/uxui-design/400/220",
    aiReason: "사용자 경험과 서비스 기획 역량이 돋보이는 당신에게 추천해요!",
  },
];

// ───── 세미나 데이터 ─────
type SeminarItem = {
  id: number;
  title: string;
  desc: string;
  organizer: string;
  date: string;
  time: string;
  tags: string[];
  image: string;
  coins: number;
  aiReason: string;
};

const SEMINARS: SeminarItem[] = [
  {
    id: 1,
    title: "2026 AI 실무 특강",
    desc: "실무에서 바로 쓰는 AI 모델 개발과 활용 노하우를 학습하세요.",
    organizer: "한국AI연구원(KAIR)",
    date: "05.28",
    time: "19:00",
    tags: ["인공지능", "실무"],
    image: "https://picsum.photos/seed/ai-seminar/160/120",
    coins: 15,
    aiReason: "AI 실무 역량 향상에 도움이 되는 강의에요!",
  },
  {
    id: 2,
    title: "데이터 분석 세미나",
    desc: "데이터 시각화와 분석 기법으로 인사이트를 도출해보세요.",
    organizer: "데이터사이언스 협회",
    date: "06.01",
    time: "14:00",
    tags: ["데이터", "분석"],
    image: "https://picsum.photos/seed/data-seminar/160/120",
    coins: 20,
    aiReason: "데이터 분석 역량 강화에 도움이 되는 세미나에요!",
  },
  {
    id: 3,
    title: "스타트업 창업 세미나",
    desc: "성공적인 창업을 위한 전략과 코칭 노하우를 전해드려요.",
    organizer: "글로벌스타트업센터",
    date: "06.05",
    time: "16:00",
    tags: ["창업", "전략"],
    image: "https://picsum.photos/seed/startup-seminar/160/120",
    coins: 25,
    aiReason: "창업 역량과 성장 전략에 도움이 되는 세미나에요!",
  },
  {
    id: 4,
    title: "UX/UI 디자인 세미나",
    desc: "사용자 중심 서비스 기획과 UX/UI 디자인 원칙을 배워보세요.",
    organizer: "디자인랩 스튜디오",
    date: "06.12",
    time: "13:00",
    tags: ["UX/UI", "디자인"],
    image: "https://picsum.photos/seed/uxui-seminar/160/120",
    coins: 30,
    aiReason: "UX/UI 디자인 역량 향상에 도움이 되는 세미나에요!",
  },
];

const CATEGORY_FILTERS = ["전체", "인공지능", "개발", "창업", "디자인"];

const TAG_COLORS: Record<string, string> = {
  인공지능: "bg-purple-100 text-purple-700",
  아이디어: "bg-yellow-100 text-yellow-700",
  데이터: "bg-blue-100 text-blue-700",
  분석: "bg-blue-100 text-blue-700",
  창업: "bg-green-100 text-green-700",
  전략: "bg-green-100 text-green-700",
  "UX/UI": "bg-pink-100 text-pink-700",
  디자인: "bg-pink-100 text-pink-700",
  기획: "bg-orange-100 text-orange-700",
  실무: "bg-slate-100 text-slate-700",
};

export function Recommendation() {
  const [tab, setTab] = useState<Tab>("contest");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

  const toggleBookmark = (id: number) =>
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filteredContests = CONTESTS.filter((c) => {
    const matchCat = category === "전체" || c.tags.some((t) => t.includes(category) || category.includes(t));
    const matchQ = query === "" || `${c.title} ${c.organizer}`.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredSeminars = SEMINARS.filter((s) => {
    const matchCat = category === "전체" || s.tags.some((t) => t.includes(category) || category.includes(t));
    const matchQ = query === "" || `${s.title} ${s.organizer}`.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      {/* ── 메인 콘텐츠 ── */}
      <div className="space-y-5">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">공모전 · 세미나</h1>

        {/* 탭 */}
        <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {(["contest", "seminar"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setCategory("전체"); setQuery(""); }}
              className={cn(
                "py-3 text-base font-black transition-colors",
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50",
              )}
            >
              {t === "contest" ? "공모" : "세미나"}
            </button>
          ))}
        </div>

        {/* AI 추천 배너 */}
        {tab === "seminar" ? (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <Coins className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div>
              <p className="text-sm font-black text-slate-900">
                세미나 참여 시 <span className="text-blue-600">코인을 획득할 수 있어요!</span>
              </p>
              <p className="text-xs font-bold text-slate-500">세미나를 시청하거나 참석하고 코인을 모아보세요.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-black text-blue-600">
            <Sparkles className="h-4 w-4" />
            AI가 관심 분야를 바탕으로 추천한 공모전 리스트
          </div>
        )}

        {/* 카테고리 필터 + 검색 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-black transition-colors",
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300",
                )}
              >
                {cat}
              </button>
            ))}
            {tab === "contest" && (
              <button className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 hover:border-blue-300">
                전체중 <ChevronDown className="h-3.5 w-3.5" />
              </button>
            )}
            {tab === "seminar" && (
              <button className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 hover:border-blue-300">
                온라인 <ChevronDown className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="relative w-52">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "contest" ? "공모전을 검색하세요" : "세미나를 검색하세요"}
              className="h-9 rounded-full border-slate-200 pl-4 pr-9 text-sm"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* ── 공모전 리스트 ── */}
        {tab === "contest" && (
          <div className="space-y-3">
            {filteredContests.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                {/* 썸네일 */}
                <div className="h-[100px] w-[130px] shrink-0 overflow-hidden rounded-xl">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>

                {/* 본문 */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-950">{item.title}</h2>
                    <p className="mt-0.5 text-sm font-bold text-slate-500">{item.desc}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">주최 &nbsp; {item.organizer}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className={cn("rounded-full px-2.5 py-0.5 text-xs font-black", TAG_COLORS[tag] ?? "bg-slate-100 text-slate-600")}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI 추천 박스 */}
                <div className="hidden w-[170px] shrink-0 flex-col justify-center gap-1.5 rounded-xl bg-blue-50 p-3 xl:flex">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-700">
                    <Bot className="h-4 w-4" />
                    AI 추천
                  </div>
                  <p className="text-xs font-bold leading-5 text-slate-600">{item.aiReason}</p>
                </div>

                {/* D-Day + 버튼 */}
                <div className="flex shrink-0 flex-col items-end justify-between">
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className="text-slate-300 transition hover:text-blue-500"
                  >
                    <Heart className={cn("h-5 w-5", bookmarked.has(item.id) && "fill-blue-500 text-blue-500")} />
                  </button>
                  <div className="text-right">
                    <p className="text-xl font-black text-blue-600">{item.dDay}</p>
                    <p className="text-xs font-bold text-slate-400">- {item.deadline}</p>
                    <Button className="mt-2 h-8 rounded-xl bg-blue-600 px-4 text-xs font-black hover:bg-blue-700">
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 세미나 리스트 ── */}
        {tab === "seminar" && (
          <div className="space-y-3">
            {filteredSeminars.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                {/* 썸네일 */}
                <div className="h-[100px] w-[130px] shrink-0 overflow-hidden rounded-xl">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>

                {/* 본문 */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-950">{item.title}</h2>
                    <p className="mt-0.5 text-sm font-bold text-slate-500">{item.desc}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">주최 &nbsp; {item.organizer}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className={cn("rounded-full px-2.5 py-0.5 text-xs font-black", TAG_COLORS[tag] ?? "bg-slate-100 text-slate-600")}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI 추천 박스 */}
                <div className="hidden w-[170px] shrink-0 flex-col justify-center gap-1.5 rounded-xl bg-blue-50 p-3 xl:flex">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-700">
                    <Bot className="h-4 w-4" />
                    AI 추천
                  </div>
                  <p className="text-xs font-bold leading-5 text-slate-600">{item.aiReason}</p>
                </div>

                {/* 날짜 + 코인 + 버튼 */}
                <div className="flex shrink-0 flex-col items-end justify-between">
                  <button
                    onClick={() => toggleBookmark(item.id + 100)}
                    className="text-slate-300 transition hover:text-blue-500"
                  >
                    <Heart className={cn("h-5 w-5", bookmarked.has(item.id + 100) && "fill-blue-500 text-blue-500")} />
                  </button>
                  <div className="text-right">
                    <p className="text-xl font-black text-blue-600">{item.date}</p>
                    <p className="text-xs font-bold text-slate-400">- {item.time}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-xs font-black text-yellow-600">
                      <Coins className="h-3.5 w-3.5" />
                      참여 시 +{item.coins}코인
                    </div>
                    <Button className="mt-2 h-8 rounded-xl bg-blue-600 px-4 text-xs font-black hover:bg-blue-700">
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 사이드바 ── */}
      <aside className="space-y-4 lg:sticky lg:top-[7.5rem] lg:self-start">
        {/* AI 추천 요약 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-black text-blue-600">
            <Sparkles className="h-4 w-4" />
            AI 추천
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Trophy className="h-4 w-4 text-yellow-500" />
                공모
              </div>
              <span className="text-sm font-black text-slate-900">{CONTESTS.length}건</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <span className="text-base">🔑</span>
                세미나
              </div>
              <span className="text-sm font-black text-slate-900">{SEMINARS.length}건</span>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Heart className="h-4 w-4 text-red-400" />
                관심 분야
              </div>
              <p className="mt-1 text-sm font-black text-slate-900">인공지능 · 개발 · 창업</p>
            </div>
          </div>
        </div>

        {/* 세미나 코인 안내 */}
        {tab === "seminar" && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <div className="flex items-center gap-2 text-sm font-black text-yellow-700">
              <Coins className="h-4 w-4" />
              세미나 참여 시 코인을 획득할 수 있어요!
            </div>
            <p className="mt-2 text-xs font-bold text-slate-500">세미나를 시청하거나 참석하고 코인을 모아보세요.</p>
          </div>
        )}

        {/* AI 팁 */}
        {tab === "contest" && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-2 text-sm font-black text-blue-700">
              <Sparkles className="h-4 w-4" />
              AI 추천 팁
            </div>
            <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
              선택한 세미나·강을 선택하면 AI가 추천한 세부 내용이 통합된 형식으로 표시됩니다.
            </p>
          </div>
        )}

        {/* 하단 일러스트 배너 */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=400&h=200"
            alt="성장"
            className="mb-4 h-32 w-full rounded-xl object-cover"
          />
          <p className="text-sm font-bold text-slate-500">새로운 기회가 당신을 기다리고 있어요!</p>
          <p className="mt-1 text-base font-black text-blue-600">오늘도 한 걸음 성장해요!</p>
        </div>
      </aside>
    </div>
  );
}
