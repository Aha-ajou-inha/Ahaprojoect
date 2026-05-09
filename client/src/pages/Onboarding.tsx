import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  university: z.string().min(2, { message: "대학교를 입력해주세요." }),
  major: z.string().min(2, { message: "전공을 입력해주세요." }),
  year: z.string().min(1, { message: "학년을 선택해주세요." }),
  goal: z.string().min(5, { message: "목표를 5자 이상 입력해주세요." }),
  stacks: z.array(z.string()).refine((value) => value.length > 0, {
    message: "관심 스택을 최소 하나 이상 선택해주세요.",
  }),
});

const techStacks = [
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "node", label: "Node.js" },
  { id: "spring", label: "Spring Boot" },
  { id: "python", label: "Python" },
  { id: "figma", label: "Figma" },
];

export function Onboarding() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      university: "",
      major: "",
      year: "",
      goal: "",
      stacks: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert("프로필 정보가 저장되었습니다.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-50">
          프로필 설정
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">스펙과 목표를 등록하세요</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          입력한 정보는 공모전 추천, 멘토 매칭, 포트폴리오 피드백의 기본 컨텍스트로 활용됩니다.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-black">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대학교</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 세종대학교" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>전공</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 컴퓨터공학과" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>학년</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="학년을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1학년</SelectItem>
                        <SelectItem value="2">2학년</SelectItem>
                        <SelectItem value="3">3학년</SelectItem>
                        <SelectItem value="4">4학년</SelectItem>
                        <SelectItem value="5">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stacks"
                render={() => (
                  <FormItem>
                    <div>
                      <FormLabel className="text-base font-black">관심 스택 / 직무</FormLabel>
                      <FormDescription>관심 있는 기술이나 직무를 선택하세요.</FormDescription>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {techStacks.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="stacks"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-200 bg-white p-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(field.value?.filter((value) => value !== item.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-semibold">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이번 학기 목표</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="예: 프론트엔드 프로젝트 2개 완성, 해커톤 참가, 포트폴리오 개선"
                        className="h-32 resize-none leading-6"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>목표가 구체적일수록 추천 품질이 좋아집니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                저장하고 추천 받기
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
