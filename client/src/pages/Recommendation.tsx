import { useEffect, useMemo, useState } from "react";
import { Bookmark, CalendarDays, Eye, Filter, Search, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";

type Contest = {
  id: number;
  title: string;
  organizer: string;
  dDay: string;
  views: string | number;
  viewLabel?: string;
  image: string;
  imageUrl?: string;
  category?: string;
};

export function Recommendation() {
  const dummyContests = useMemo<Contest[]>(() => [
    {
      id: 1,
      title: "2026년 트래블 이노베이션 아이디어 공모전",
      organizer: "야놀자 Research",
      dDay: "D-61",
      views: "1,946",
      image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400&h=400",
      category: "아이디어",
    },
    {
      id: 2,
      title: "제5회 고용노동 공공데이터·AI 활용 공모전",
      organizer: "고용노동부",
      dDay: "D-5",
      views: "2,995",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=400",
      category: "데이터",
    },
    {
      id: 3,
      title: "[넥슨] 메이플스토리 해커톤, 2026 메커톤",
      organizer: "넥슨 코리아",
      dDay: "D-2",
      views: "1,822",
      image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=400&h=400",
      category: "해커톤",
    },
    {
      id: 4,
      title: "제13회 산업안전보건 조사자료 논문경진대회",
      organizer: "안전보건공단",
      dDay: "D-22",
      views: "2,032",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400&h=400",
      category: "논문",
    },
    {
      id: 5,
      title: "2026 화성에서 ON : 감축 탄소 아이디어 경진대회",
      organizer: "한국전력공사",
      dDay: "D-1",
      views: "1,268",
      image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80&w=400&h=400",
      category: "환경",
    },
  ], []);
  const [contests, setContests] = useState<Contest[]>(dummyContests);
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiGet<{ contests: Contest[] }>("/api/contests")
      .then((data) => setContests(data.contests))
      .catch(() => setContests(dummyContests));
  }, [dummyContests]);

  const filteredContests = contests.filter((item) => {
    const text = `${item.title} ${item.organizer} ${item.category ?? ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
            <Trophy className="h-4 w-4" />
            공모전 추천
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">마감 임박 활동을 빠르게 비교하세요</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            조회수, 마감일, 주최기관을 한 카드에서 확인할 수 있게 정리했습니다.
          </p>
        </div>
        <div className="grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 px-4 py-3 text-blue-700">{contests.length}개 활동</div>
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-700">AI 추천 가능</div>
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-amber-700">북마크 지원</div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="공모전명, 주최기관, 분야 검색"
            className="pl-9"
          />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
            전체 분야
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4" />
            저장한 활동
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredContests.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={item.imageUrl ?? item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge className="bg-blue-600 text-white hover:bg-blue-600">{item.dDay}</Badge>
                {item.category && (
                  <Badge variant="secondary" className="bg-white/90 text-slate-700 hover:bg-white/90">
                    {item.category}
                  </Badge>
                )}
              </div>
              <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm transition-colors hover:text-blue-700">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <h2 className="line-clamp-2 min-h-11 text-base font-black leading-snug text-slate-950 group-hover:text-blue-700">
                  {item.title}
                </h2>
                <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-500">{item.organizer}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {item.dDay}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {item.viewLabel ?? item.views}
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
