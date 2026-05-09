import { useState } from "react";
import { Image, MoreVertical, Paperclip, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = {
  id: number;
  text: string;
  sender: "mentor" | "me";
  time: string;
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "안녕하세요. 프론트엔드 모의 면접 상담으로 매칭된 김선배입니다.", sender: "mentor", time: "14:02" },
    { id: 2, text: "사전에 이력서나 포트폴리오를 보내주시면 면접 질문을 더 정확히 준비할 수 있어요.", sender: "mentor", time: "14:03" },
    { id: 3, text: "안녕하세요 멘토님. 반갑습니다.", sender: "me", time: "14:10" },
    { id: 4, text: "깃허브 링크와 이력서 PDF를 잠시 후 보내드리겠습니다.", sender: "me", time: "14:11" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: input,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-158px)] flex-col gap-5 lg:flex-row">
      <Card className="hidden w-80 flex-col overflow-hidden lg:flex">
        <div className="border-b border-slate-100 p-4 text-lg font-black text-slate-950">채팅 목록</div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          <div className="flex cursor-pointer items-center gap-3 rounded-lg bg-blue-50 p-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">멘토</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-slate-950">김선배 멘토</span>
                <span className="text-xs font-semibold text-slate-400">14:11</span>
              </div>
              <p className="truncate text-xs font-medium text-slate-500">깃허브 링크와 이력서 PDF를...</p>
            </div>
          </div>

          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-emerald-600 text-white">팀</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-slate-950">Aingthon 팀 채팅</span>
                <span className="text-xs font-semibold text-slate-400">어제</span>
              </div>
              <p className="truncate text-xs font-medium text-slate-500">내일 강남역 스터디룸에서 만나요.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">멘토</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-black text-slate-950">김선배 멘토</h2>
              <p className="text-xs font-bold text-emerald-600">온라인</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 p-5">
          <div className="my-2 text-center text-xs font-bold text-slate-400">2026년 5월 9일</div>
          {messages.map((msg) => {
            const isMe = msg.sender === "me";

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[78%] gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {!isMe && (
                    <Avatar className="mt-1 h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-xs text-white">멘토</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-lg px-4 py-2.5 text-sm font-medium leading-6 ${
                        isMe
                          ? "bg-blue-600 text-white"
                          : "border border-slate-100 bg-white text-slate-800 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 px-1 text-[11px] font-semibold text-slate-400">{msg.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <button className="text-slate-400 transition-colors hover:text-slate-600">
              <Paperclip className="h-5 w-5" />
            </button>
            <button className="text-slate-400 transition-colors hover:text-slate-600">
              <Image className="h-5 w-5" />
            </button>
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요"
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button onClick={handleSend} size="icon" className="h-9 w-9 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
