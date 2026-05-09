import { useState } from "react";
import { CheckCircle2, Copy, Loader2, Megaphone, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";

export function Promotion() {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim() || !audience.trim() || !keywords.trim()) {
      alert("모임명, 모집 대상, 강조 키워드를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setResult("");
    setCopied(false);

    try {
      const data = await apiPost<{ generatedText: string }>("/api/ai/generate-post", {
        title,
        audience,
        keywords,
      });
      setResult(data.generatedText);
    } catch (error) {
      console.error(error);
      alert("홍보글 생성에 실패했습니다. 백엔드 서버와 Gemini API 키를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Badge className="mb-3 bg-amber-50 text-amber-700 hover:bg-amber-50">
          AI 홍보글 생성
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">모집글을 더 읽히게 다듬습니다</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          핵심 정보만 입력하면 커뮤니티 게시판에 바로 올릴 수 있는 자연스러운 홍보 문안을 생성합니다.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Megaphone className="h-5 w-5 text-amber-600" />
              모집 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">모임 / 행사 이름</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: UniLink 해커톤 팀원 모집"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">모집 대상</label>
              <Input
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="예: React에 관심 있는 프론트엔드 개발자 2명"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">강조 키워드</label>
              <Textarea
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="예: 초보 환영, 빠른 피드백, 포트폴리오 완성, 수상 목표"
                className="h-28 resize-none leading-6"
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  작성 중
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  홍보글 생성
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className={result ? "border-amber-200" : ""}>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-lg font-black">생성 결과</CardTitle>
            {result && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "복사됨" : "복사"}
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-h-[420px] p-5">
            {loading ? (
              <div className="space-y-4 py-8">
                <div className="h-4 w-2/3 animate-pulse rounded bg-amber-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ) : result ? (
              <div className="max-h-[620px] overflow-y-auto rounded-lg border border-amber-100 bg-amber-50/60 p-5 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-800">
                {result}
              </div>
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 text-center text-slate-400">
                <Sparkles className="h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold">정보를 입력하면 생성된 홍보글이 여기에 표시됩니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
