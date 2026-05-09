import { CalendarDays, Star, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mentors = [
  {
    id: 1,
    name: "김선배",
    field: "프론트엔드",
    career: "토스 Frontend Engineer",
    rating: 4.9,
    consultCount: 128,
    coinPerSession: 50,
    tags: ["React", "면접", "포트폴리오"],
  },
  {
    id: 2,
    name: "이기획",
    field: "서비스 기획",
    career: "카카오 Product Manager",
    rating: 4.8,
    consultCount: 94,
    coinPerSession: 45,
    tags: ["PM", "UX", "MVP"],
  },
  {
    id: 3,
    name: "박데이터",
    field: "데이터 분석",
    career: "네이버 Data Analyst",
    rating: 4.7,
    consultCount: 71,
    coinPerSession: 40,
    tags: ["SQL", "Python", "공모전"],
  },
];

export function Mentors() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
            <UserCheck className="h-4 w-4" />
            멘토링
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">선배 멘토와 직접 상담하세요</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            직무, 포트폴리오, 면접 준비에 맞는 현직자와 졸업생 멘토를 직접 선택해 예약합니다.
          </p>
        </div>
        <Button asChild>
          <Link to="/mentors/schedule">
            <CalendarDays className="h-4 w-4" />
            상담 일정 보기
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-600 font-black text-white">{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-black">{mentor.name}</CardTitle>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{mentor.field}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                  <Star className="mr-1 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {mentor.rating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-bold text-slate-700">{mentor.career}</p>
              <div className="flex flex-wrap gap-2">
                {mentor.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-white text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                상담 {mentor.consultCount}회 · {mentor.coinPerSession}C / 세션
              </div>
              <Button asChild className="w-full">
                <Link to="/mentors/schedule">
                  <CalendarDays className="h-4 w-4" />
                  일정 예약
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
