import { Megaphone, MessageCircle, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const clubs = [
  {
    id: 1,
    name: "수도권 Web Makers",
    schools: "인하대 · 아주대 · 세종대",
    members: 184,
    topic: "웹 서비스 프로젝트와 배포 스터디",
    tags: ["React", "Node", "배포"],
  },
  {
    id: 2,
    name: "Design to MVP",
    schools: "홍익대 · 한양대 · 중앙대",
    members: 92,
    topic: "디자이너와 개발자가 함께 만드는 MVP",
    tags: ["Figma", "PM", "Prototype"],
  },
  {
    id: 3,
    name: "Data Challenge Club",
    schools: "고려대 · 경희대 · 광운대",
    members: 126,
    topic: "공공데이터 공모전 팀 빌딩",
    tags: ["Python", "SQL", "AI"],
  },
];

export function Clubs() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
            <Users className="h-4 w-4" />
            동아리 협업
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">학교를 넘는 동아리 협업 공간</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">수도권 대학 동아리가 프로젝트, 세미나, 팀 빌딩을 함께 운영하는 공간입니다.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          협업방 만들기
        </Button>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {clubs.map((club) => (
          <Card key={club.id} className="transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <CardHeader>
              <Badge className="mb-3 w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{club.schools}</Badge>
              <CardTitle className="text-xl font-black">{club.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium leading-6 text-slate-600">{club.topic}</p>
              <div className="flex flex-wrap gap-2">
                {club.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-white">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {club.members}명
                </span>
                <span className="inline-flex items-center gap-1.5 text-blue-700">
                  <MessageCircle className="h-4 w-4" />
                  협업방 입장
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-black">
            <Megaphone className="h-5 w-5 text-blue-600" />
            동아리 공지
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {["연합 세미나 발표자 모집", "공모전 팀 매칭 주간", "신규 동아리 인증 접수"].map((notice) => (
            <div key={notice} className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700">
              {notice}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
