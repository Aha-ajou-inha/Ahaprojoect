import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Plus, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet } from "@/lib/api";

type RecruitmentItem = {
  id: number;
  kind: "study" | "club" | string;
  type: string;
  title: string;
  subject: string;
  schedule: string;
  location: string;
  current: number;
  max: number;
  tags: string[];
};

export function Recruitment() {
  const dummyStudies = useMemo<RecruitmentItem[]>(() => [
    {
      id: 1,
      kind: "study",
      type: "스터디",
      title: "React + TypeScript 기초 스터디원 모집",
      subject: "프론트엔드",
      schedule: "매주 목요일 19:00",
      location: "강남역 스터디룸",
      current: 3,
      max: 6,
      tags: ["React", "TypeScript", "초보환영"],
    },
    {
      id: 2,
      kind: "study",
      type: "스터디",
      title: "알고리즘 코딩테스트 박살내기",
      subject: "알고리즘",
      schedule: "주 2회 온라인 20:00",
      location: "Discord",
      current: 2,
      max: 4,
      tags: ["Python", "백준", "프로그래머스"],
    },
  ], []);

  const dummyClubs = useMemo<RecruitmentItem[]>(() => [
    {
      id: 3,
      kind: "club",
      type: "동아리",
      title: "IT 연합 창업 동아리 SOPT 34기 모집",
      subject: "기획/디자인/개발",
      schedule: "매주 토요일 세션",
      location: "서울 주요 대학",
      current: 40,
      max: 100,
      tags: ["연합동아리", "스타트업", "프로젝트"],
    },
  ], []);
  const fallbackItems = useMemo(() => [...dummyStudies, ...dummyClubs], [dummyStudies, dummyClubs]);
  const [items, setItems] = useState<RecruitmentItem[]>(fallbackItems);
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiGet<{ recruitments: RecruitmentItem[] }>("/api/recruitments")
      .then((data) => setItems(data.recruitments))
      .catch(() => setItems(fallbackItems));
  }, [fallbackItems]);

  const filteredItems = items.filter((item) => {
    const text = `${item.title} ${item.subject} ${item.location} ${item.tags.join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });
  const studyItems = filteredItems.filter((item) => item.kind === "study");
  const clubItems = filteredItems.filter((item) => item.kind === "club");

  const ItemCard = ({ item }: { item: RecruitmentItem }) => {
    const ratio = Math.min((item.current / item.max) * 100, 100);

    return (
      <Card className="transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Badge className={item.kind === "study" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}>
              {item.type}
            </Badge>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              <Users className="h-3.5 w-3.5" />
              {item.current}/{item.max}명
            </div>
          </div>
          <CardTitle className="line-clamp-2 min-h-12 text-lg font-black leading-snug">{item.title}</CardTitle>
          <p className="text-sm font-bold text-blue-700">{item.subject}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              {item.schedule}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              {item.location}
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${ratio}%` }} />
          </div>

          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-slate-200 bg-white text-xs text-slate-600">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-400">최근 모집</span>
          <Button size="sm">지원하기</Button>
        </CardFooter>
      </Card>
    );
  };

  const renderGrid = (list: RecruitmentItem[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
            <Users className="h-4 w-4" />
            모집 게시판
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">스터디와 동아리를 빠르게 찾으세요</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            일정, 위치, 모집 현황을 비교하기 쉽게 정리했습니다.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          새 모집글
        </Button>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목, 분야, 장소, 태그 검색"
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-lg bg-slate-100 p-1">
          <TabsTrigger value="all">전체 {filteredItems.length}</TabsTrigger>
          <TabsTrigger value="study">스터디 {studyItems.length}</TabsTrigger>
          <TabsTrigger value="club">동아리 {clubItems.length}</TabsTrigger>
        </TabsList>
        <div className="mt-5">
          <TabsContent value="all" className="m-0">
            {renderGrid(filteredItems)}
          </TabsContent>
          <TabsContent value="study" className="m-0">
            {renderGrid(studyItems)}
          </TabsContent>
          <TabsContent value="club" className="m-0">
            {renderGrid(clubItems)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
