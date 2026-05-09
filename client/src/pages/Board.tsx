import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, MessageSquare, Plus, Search, ShieldCheck, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";

const posts = [
  {
    id: 1,
    title: "해커톤 팀 빌딩 전에 정하면 좋은 역할 분담 기준",
    category: "프로젝트",
    author: "익명",
    likes: 24,
    comments: 8,
    status: "pass",
  },
  {
    id: 2,
    title: "공모전 자료 공유방 링크 모음",
    category: "공모전",
    author: "민지",
    likes: 15,
    comments: 3,
    status: "pass",
  },
  {
    id: 3,
    title: "연락처를 공개한 오픈채팅 모집글",
    category: "검수 필요",
    author: "익명",
    likes: 2,
    comments: 1,
    status: "review",
  },
];

export function Board() {
  const [moderationText, setModerationText] = useState("카톡 오픈채팅으로 연락 주세요. 010-1234-5678");
  const [moderationResult, setModerationResult] = useState<{ pass: boolean; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const runModeration = async () => {
    setLoading(true);
    try {
      const result = await apiPost<{ pass: boolean; reason: string }>("/api/ai/moderate", {
        content: moderationText,
      });
      setModerationResult(result);
    } catch (error) {
      console.error(error);
      setModerationResult({
        pass: false,
        reason: "서버 검수 API를 호출하지 못했습니다. 백엔드 서버 실행 상태를 확인해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-600">
            <MessageSquare className="h-4 w-4" />
            자유게시판
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">학교 밖 정보도 안전하게 공유하세요</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">AI 관리자 필터로 개인정보 노출과 스팸성 게시글을 검토합니다.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          글 작성
        </Button>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="게시글 검색" className="pl-9" />
          </div>

          {posts.map((post) => (
            <Card key={post.id} className="transition-colors hover:border-blue-200">
              <CardContent className="p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant={post.status === "pass" ? "secondary" : "outline"} className={post.status === "pass" ? "bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                    {post.status === "pass" ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <AlertTriangle className="mr-1 h-3.5 w-3.5" />}
                    {post.status === "pass" ? "AI 검수 통과" : "검수 필요"}
                  </Badge>
                  <Badge variant="outline" className="bg-white">{post.category}</Badge>
                </div>
                <h2 className="text-xl font-black text-slate-950">{post.title}</h2>
                <div className="mt-4 flex items-center gap-4 text-sm font-semibold text-slate-500">
                  <span>{post.author}</span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit border-blue-100 bg-blue-50/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <ShieldCheck className="h-5 w-5 text-blue-700" />
              AI 관리자 필터
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-medium leading-6 text-slate-600">
            <p>게시글 등록 시 욕설, 스팸성 광고, 개인정보 노출, 허위 정보를 우선 탐지합니다.</p>
            <div className="rounded-lg bg-white p-3 font-bold text-blue-700">발표 시연 포인트: 부적절한 글 작성 → AI 차단 결과 표시</div>
            <Textarea
              value={moderationText}
              onChange={(event) => setModerationText(event.target.value)}
              className="h-28 resize-none bg-white"
            />
            <Button onClick={runModeration} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  검수 중
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  검수 실행
                </>
              )}
            </Button>
            {moderationResult && (
              <div className={`rounded-lg border p-3 font-bold ${moderationResult.pass ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-amber-100 bg-amber-50 text-amber-700"}`}>
                {moderationResult.pass ? "통과" : "검토 필요"} · {moderationResult.reason}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
