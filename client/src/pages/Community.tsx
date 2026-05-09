import { ArrowRight, BookOpen, Briefcase, CalendarDays, Code2, Goal, Handshake, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const communities = [
  {
    id: 1,
    name: "프론트엔드 취업 준비",
    members: 238,
    description: "포트폴리오, 기술 면접, 과제 전형 정보를 공유합니다.",
    icon: Code2,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    id: 2,
    name: "서비스 기획 커리어",
    members: 146,
    description: "PM/PO 직무 분석, MVP 문서, UX 리서치 사례를 공유합니다.",
    icon: Briefcase,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    id: 3,
    name: "공모전 수상 전략",
    members: 301,
    description: "공모전 기획서, 발표 자료, 팀 빌딩 경험을 모읍니다.",
    icon: Goal,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    id: 4,
    name: "스터디 운영 노하우",
    members: 97,
    description: "출석 관리, 커리큘럼, 회고 템플릿을 공유합니다.",
    icon: BookOpen,
    tone: "bg-violet-50 text-violet-700",
  },
];

const communityShortcuts = [
  { label: "자유게시판", href: "/board", icon: MessageSquare },
  { label: "동아리 협업", href: "/clubs", icon: Handshake },
  { label: "행사/세미나", href: "/events", icon: CalendarDays },
];

export function Community() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
          <Users className="h-4 w-4" />
          커뮤니티
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">같은 목표를 가진 사람들과 이어지세요</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          게시판, 동아리 협업, 행사 정보를 한 곳으로 묶었습니다.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {communityShortcuts.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-sm font-black text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {communities.map((community) => {
          const Icon = community.icon;

          return (
            <Link key={community.id} to="/board">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${community.tone}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-black text-slate-950">{community.name}</h2>
                  <p className="mt-2 flex-1 text-sm font-medium leading-6 text-slate-600">{community.description}</p>
                  <Badge variant="secondary" className="mt-5 w-fit bg-slate-100 text-slate-700">
                    {community.members}명 참여
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
