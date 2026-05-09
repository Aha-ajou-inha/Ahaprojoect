import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const upcomingEvents = [
    {
      id: 1,
      title: "프론트엔드 모의 면접 상담",
      type: "상담",
      time: "오늘 19:00 - 20:00",
      location: "Google Meet",
      with: "김선배 멘토",
      isOnline: true,
    },
    {
      id: 2,
      title: "Aingthon 해커톤 팀 기획 회의",
      type: "팀 회의",
      time: "내일 14:00 - 16:00",
      location: "강남역 스터디룸",
      with: "김개발, 박디자인, 최기획",
      isOnline: false,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
          <CalendarIcon className="h-4 w-4" />
          일정 관리
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">상담과 팀 일정을 한눈에 관리하세요</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          매칭 이후의 상담, 회의, 스터디 약속을 캘린더와 리스트로 확인합니다.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-black">일정 캘린더</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg border-0"
              classNames={{
                selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                today: "bg-slate-100 text-slate-950 font-bold",
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">다가오는 일정</h2>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              {upcomingEvents.length}건
            </Badge>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="transition-colors hover:border-blue-200">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <Badge className={event.type === "상담" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}>
                      {event.type}
                    </Badge>
                    <span className="text-sm font-black text-red-500">{event.time.split(" ")[0]}</span>
                  </div>
                  <h3 className="mb-4 text-xl font-black text-slate-950">{event.title}</h3>

                  <div className="grid gap-2 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {event.time.replace(/^[^ ]+ /, "")}
                    </div>
                    <div className="flex items-center gap-2">
                      {event.isOnline ? <Video className="h-4 w-4 text-slate-400" /> : <MapPin className="h-4 w-4 text-slate-400" />}
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      {event.with}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
