import { CalendarDays, MapPin, Plus, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const events = [
  {
    id: 1,
    title: "수도권 대학 연합 네트워킹 데이",
    date: "2026.05.18",
    location: "판교 스타트업 캠퍼스",
    category: "네트워킹",
    attendees: 86,
    description: "개발, 디자인, 기획 직군 학생들이 팀 빌딩을 경험하는 오프라인 행사입니다.",
  },
  {
    id: 2,
    title: "AI 포트폴리오 클리닉",
    date: "2026.05.22",
    location: "온라인 Zoom",
    category: "세미나",
    attendees: 42,
    description: "현직 멘토가 프로젝트 설명과 이력서 문장을 실시간으로 피드백합니다.",
  },
  {
    id: 3,
    title: "UniLink 미니 해커톤",
    date: "2026.06.01",
    location: "아주대학교",
    category: "해커톤",
    attendees: 120,
    description: "수도권 대학생이 섞여 6시간 동안 MVP를 만드는 실전형 해커톤입니다.",
  },
];

export function Events() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
            <CalendarDays className="h-4 w-4" />
            행사와 세미나
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">학교 밖 연결 기회를 찾으세요</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">네트워킹, 세미나, 해커톤을 한 화면에서 확인합니다.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          행사 등록
        </Button>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="행사명, 장소, 카테고리 검색" className="pl-9" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <CardHeader>
              <div className="mb-3 flex items-center justify-between">
                <Badge className="bg-blue-600 text-white">{event.category}</Badge>
                <span className="text-sm font-black text-red-500">{event.date}</span>
              </div>
              <CardTitle className="line-clamp-2 text-xl font-black leading-snug">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-3 text-sm font-medium leading-6 text-slate-600">{event.description}</p>
              <div className="space-y-2 text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  {event.attendees}명 관심
                </div>
              </div>
              <Button className="w-full">참여 신청</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
