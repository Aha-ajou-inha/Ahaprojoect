import { useEffect, useMemo, useState } from "react";
import { Briefcase, Code, GraduationCap, Palette, Search, Send, UserPlus, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  university: string;
  major: string;
  stacks: string[];
  lookingFor: string;
  icon?: LucideIcon;
  iconKey?: string;
};

const iconByKey: Record<string, LucideIcon> = {
  code: Code,
  palette: Palette,
  briefcase: Briefcase,
};

const filters = ["전체", "프론트엔드", "백엔드", "기획", "디자인"];

export function TeamMatching() {
  const dummyTeammates = useMemo<TeamMember[]>(() => [
    {
      id: 1,
      name: "김개발",
      role: "프론트엔드",
      university: "한양대학교",
      major: "컴퓨터소프트웨어학부",
      stacks: ["React", "TypeScript", "Next.js"],
      lookingFor: "해커톤 프로젝트 팀원을 구합니다.",
      icon: Code,
    },
    {
      id: 2,
      name: "김유진",
      role: "UI/UX 디자이너",
      university: "홍익대학교",
      major: "시각디자인학과",
      stacks: ["Figma", "Protopie", "Illustrator"],
      lookingFor: "포트폴리오용 사이드 프로젝트를 함께 만들 팀을 찾고 있어요.",
      icon: Palette,
    },
    {
      id: 3,
      name: "박기획",
      role: "서비스 기획자",
      university: "고려대학교",
      major: "경영학과",
      stacks: ["Notion", "Jira", "Figma"],
      lookingFor: "IT 창업 동아리나 MVP 프로젝트에 참여하고 싶습니다.",
      icon: Briefcase,
    },
  ], []);
  const [teammates, setTeammates] = useState<TeamMember[]>(dummyTeammates);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  useEffect(() => {
    apiGet<{ teamProfiles: TeamMember[] }>("/api/team-profiles")
      .then((data) => setTeammates(data.teamProfiles))
      .catch(() => setTeammates(dummyTeammates));
  }, [dummyTeammates]);

  const filteredMembers = teammates.filter((member) => {
    const text = `${member.name} ${member.role} ${member.university} ${member.major} ${member.stacks.join(" ")}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesFilter = activeFilter === "전체" || member.role.includes(activeFilter);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
            <UserPlus className="h-4 w-4" />
            팀 매칭
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">역할과 스택이 맞는 팀원을 찾으세요</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            전공, 관심 스택, 찾는 프로젝트를 카드에서 바로 비교할 수 있습니다.
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4" />
          프로필 등록
        </Button>
      </section>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름, 역할, 학교, 스택 검색"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`h-10 shrink-0 rounded-lg px-4 text-sm font-bold transition-colors ${
                activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMembers.map((member) => {
          const Icon = member.icon ?? iconByKey[member.iconKey ?? "code"] ?? Code;

          return (
            <Card key={member.id} className="transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {member.role}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-black">{member.name}</CardTitle>
                <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <GraduationCap className="h-4 w-4" />
                  <span className="line-clamp-1">
                    {member.university} · {member.major}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-700">
                  "{member.lookingFor}"
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase text-slate-400">Stacks</p>
                  <div className="flex flex-wrap gap-2">
                    {member.stacks.map((stack) => (
                      <Badge key={stack} variant="outline" className="border-slate-200 bg-white text-slate-600">
                        {stack}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full">
                  <Send className="h-4 w-4" />
                  커피챗 제안
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
