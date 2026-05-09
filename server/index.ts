import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RowDataPacket } from "mysql2/promise";
import { executeQuery, pool, selectRows } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type AsyncRoute = (req: Request, res: Response) => Promise<void>;

interface ContestRow extends RowDataPacket {
  id: number;
  title: string;
  organizer: string;
  deadline: string | null;
  views: number;
  image_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface RecruitmentRow extends RowDataPacket {
  id: number;
  kind: string;
  title: string;
  subject: string;
  schedule: string;
  location: string;
  current_members: number;
  max_members: number;
  tags: string | string[] | null;
  created_at: string;
  updated_at: string;
}

interface TeamProfileRow extends RowDataPacket {
  id: number;
  name: string;
  role: string;
  university: string;
  major: string;
  stacks: string | string[] | null;
  looking_for: string;
  icon_key: string;
  created_at: string;
  updated_at: string;
}

const asyncRoute = (handler: AsyncRoute) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void handler(req, res).catch(next);
};

const asText = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value.trim() : fallback;
};

const asInt = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

const asDate = (value: unknown, fallback: string | null = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : fallback;
};

const asStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseJsonArray = (value: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const parseLimit = (value: unknown, fallback = 50) => {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(firstValue);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 100 ? parsed : fallback;
};

const getId = (req: Request) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const formatDday = (deadline: string | null) => {
  if (!deadline) {
    return "상시";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${deadline}T00:00:00`);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

  if (diff === 0) {
    return "D-Day";
  }

  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
};

const mapContest = (row: ContestRow) => ({
  id: row.id,
  title: row.title,
  organizer: row.organizer,
  deadline: row.deadline,
  dDay: formatDday(row.deadline),
  views: row.views,
  viewLabel: Number(row.views).toLocaleString("ko-KR"),
  image: row.image_url,
  imageUrl: row.image_url,
  category: row.category,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapRecruitment = (row: RecruitmentRow) => ({
  id: row.id,
  kind: row.kind,
  type: row.kind === "club" ? "동아리" : "스터디",
  title: row.title,
  subject: row.subject,
  schedule: row.schedule,
  location: row.location,
  current: row.current_members,
  max: row.max_members,
  tags: parseJsonArray(row.tags),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTeamProfile = (row: TeamProfileRow) => ({
  id: row.id,
  name: row.name,
  role: row.role,
  university: row.university,
  major: row.major,
  stacks: parseJsonArray(row.stacks),
  lookingFor: row.looking_for,
  iconKey: row.icon_key,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

app.get("/api/health", asyncRoute(async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
}));

app.get("/api/contests", asyncRoute(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const rows = await selectRows<ContestRow[]>(
    `SELECT id, title, organizer, deadline, views, image_url, category, created_at, updated_at
     FROM contests
     ORDER BY COALESCE(deadline, '9999-12-31') ASC, created_at DESC
     LIMIT ?`,
    [limit],
  );

  res.json({ contests: rows.map(mapContest) });
}));

app.get("/api/contests/:id", asyncRoute(async (req, res) => {
  const id = getId(req);

  if (!id) {
    res.status(400).json({ error: "Invalid contest id" });
    return;
  }

  const rows = await selectRows<ContestRow[]>(
    `SELECT id, title, organizer, deadline, views, image_url, category, created_at, updated_at
     FROM contests
     WHERE id = ?`,
    [id],
  );
  const contest = rows[0];

  if (!contest) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  res.json({ contest: mapContest(contest) });
}));

app.post("/api/contests", asyncRoute(async (req, res) => {
  const title = asText(req.body.title);

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const result = await executeQuery(
    `INSERT INTO contests (title, organizer, deadline, views, image_url, category)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      title,
      asText(req.body.organizer),
      asDate(req.body.deadline),
      asInt(req.body.views),
      asText(req.body.imageUrl ?? req.body.image),
      asText(req.body.category, "general"),
    ],
  );

  const rows = await selectRows<ContestRow[]>(
    `SELECT id, title, organizer, deadline, views, image_url, category, created_at, updated_at
     FROM contests
     WHERE id = ?`,
    [result.insertId],
  );
  const contest = rows[0];

  if (!contest) {
    throw new Error("Failed to read created contest");
  }

  res.status(201).json({ contest: mapContest(contest) });
}));

app.put("/api/contests/:id", asyncRoute(async (req, res) => {
  const id = getId(req);

  if (!id) {
    res.status(400).json({ error: "Invalid contest id" });
    return;
  }

  const rows = await selectRows<ContestRow[]>(
    `SELECT id, title, organizer, deadline, views, image_url, category, created_at, updated_at
     FROM contests
     WHERE id = ?`,
    [id],
  );
  const current = rows[0];

  if (!current) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  await executeQuery(
    `UPDATE contests
     SET title = ?, organizer = ?, deadline = ?, views = ?, image_url = ?, category = ?
     WHERE id = ?`,
    [
      asText(req.body.title, current.title),
      asText(req.body.organizer, current.organizer),
      asDate(req.body.deadline, current.deadline),
      asInt(req.body.views, current.views),
      asText(req.body.imageUrl ?? req.body.image, current.image_url),
      asText(req.body.category, current.category),
      id,
    ],
  );

  const updatedRows = await selectRows<ContestRow[]>(
    `SELECT id, title, organizer, deadline, views, image_url, category, created_at, updated_at
     FROM contests
     WHERE id = ?`,
    [id],
  );
  const contest = updatedRows[0];

  if (!contest) {
    throw new Error("Failed to read updated contest");
  }

  res.json({ contest: mapContest(contest) });
}));

app.delete("/api/contests/:id", asyncRoute(async (req, res) => {
  const id = getId(req);

  if (!id) {
    res.status(400).json({ error: "Invalid contest id" });
    return;
  }

  const result = await executeQuery("DELETE FROM contests WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  res.status(204).send();
}));

app.get("/api/recruitments", asyncRoute(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const kind = asText(req.query.kind);
  const params: Array<string | number> = [];
  let where = "";

  if (kind) {
    where = "WHERE kind = ?";
    params.push(kind);
  }

  params.push(limit);

  const rows = await selectRows<RecruitmentRow[]>(
    `SELECT id, kind, title, subject, schedule, location, current_members, max_members, tags, created_at, updated_at
     FROM recruitments
     ${where}
     ORDER BY created_at DESC
     LIMIT ?`,
    params,
  );

  res.json({ recruitments: rows.map(mapRecruitment) });
}));

app.post("/api/recruitments", asyncRoute(async (req, res) => {
  const title = asText(req.body.title);

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const result = await executeQuery(
    `INSERT INTO recruitments (kind, title, subject, schedule, location, current_members, max_members, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      asText(req.body.kind, "study"),
      title,
      asText(req.body.subject),
      asText(req.body.schedule),
      asText(req.body.location),
      asInt(req.body.current),
      Math.max(asInt(req.body.max, 1), 1),
      JSON.stringify(asStringArray(req.body.tags)),
    ],
  );

  const rows = await selectRows<RecruitmentRow[]>(
    `SELECT id, kind, title, subject, schedule, location, current_members, max_members, tags, created_at, updated_at
     FROM recruitments
     WHERE id = ?`,
    [result.insertId],
  );
  const recruitment = rows[0];

  if (!recruitment) {
    throw new Error("Failed to read created recruitment");
  }

  res.status(201).json({ recruitment: mapRecruitment(recruitment) });
}));

app.put("/api/recruitments/:id", asyncRoute(async (req, res) => {
  const id = getId(req);

  if (!id) {
    res.status(400).json({ error: "Invalid recruitment id" });
    return;
  }

  const rows = await selectRows<RecruitmentRow[]>(
    `SELECT id, kind, title, subject, schedule, location, current_members, max_members, tags, created_at, updated_at
     FROM recruitments
     WHERE id = ?`,
    [id],
  );
  const current = rows[0];

  if (!current) {
    res.status(404).json({ error: "Recruitment not found" });
    return;
  }

  await executeQuery(
    `UPDATE recruitments
     SET kind = ?, title = ?, subject = ?, schedule = ?, location = ?, current_members = ?, max_members = ?, tags = ?
     WHERE id = ?`,
    [
      asText(req.body.kind, current.kind),
      asText(req.body.title, current.title),
      asText(req.body.subject, current.subject),
      asText(req.body.schedule, current.schedule),
      asText(req.body.location, current.location),
      asInt(req.body.current, current.current_members),
      Math.max(asInt(req.body.max, current.max_members), 1),
      JSON.stringify(req.body.tags === undefined ? parseJsonArray(current.tags) : asStringArray(req.body.tags)),
      id,
    ],
  );

  const updatedRows = await selectRows<RecruitmentRow[]>(
    `SELECT id, kind, title, subject, schedule, location, current_members, max_members, tags, created_at, updated_at
     FROM recruitments
     WHERE id = ?`,
    [id],
  );
  const recruitment = updatedRows[0];

  if (!recruitment) {
    throw new Error("Failed to read updated recruitment");
  }

  res.json({ recruitment: mapRecruitment(recruitment) });
}));

app.delete("/api/recruitments/:id", asyncRoute(async (req, res) => {
  const id = getId(req);

  if (!id) {
    res.status(400).json({ error: "Invalid recruitment id" });
    return;
  }

  const result = await executeQuery("DELETE FROM recruitments WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    res.status(404).json({ error: "Recruitment not found" });
    return;
  }

  res.status(204).send();
}));

app.get("/api/team-profiles", asyncRoute(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const rows = await selectRows<TeamProfileRow[]>(
    `SELECT id, name, role, university, major, stacks, looking_for, icon_key, created_at, updated_at
     FROM team_profiles
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
  );

  res.json({ teamProfiles: rows.map(mapTeamProfile) });
}));

app.post("/api/team-profiles", asyncRoute(async (req, res) => {
  const name = asText(req.body.name);

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const result = await executeQuery(
    `INSERT INTO team_profiles (name, role, university, major, stacks, looking_for, icon_key)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      asText(req.body.role),
      asText(req.body.university),
      asText(req.body.major),
      JSON.stringify(asStringArray(req.body.stacks)),
      asText(req.body.lookingFor ?? req.body.looking_for),
      asText(req.body.iconKey ?? req.body.icon_key, "code"),
    ],
  );

  const rows = await selectRows<TeamProfileRow[]>(
    `SELECT id, name, role, university, major, stacks, looking_for, icon_key, created_at, updated_at
     FROM team_profiles
     WHERE id = ?`,
    [result.insertId],
  );
  const teamProfile = rows[0];

  if (!teamProfile) {
    throw new Error("Failed to read created team profile");
  }

  res.status(201).json({ teamProfile: mapTeamProfile(teamProfile) });
}));

app.put("/api/team-profiles/:id", asyncRoute(async (req, res) => {
  const id = getId(req);

  if (!id) {
    res.status(400).json({ error: "Invalid team profile id" });
    return;
  }

  const rows = await selectRows<TeamProfileRow[]>(
    `SELECT id, name, role, university, major, stacks, looking_for, icon_key, created_at, updated_at
     FROM team_profiles
     WHERE id = ?`,
    [id],
  );
  const current = rows[0];

  if (!current) {
    res.status(404).json({ error: "Team profile not found" });
    return;
  }

  await executeQuery(
    `UPDATE team_profiles
     SET name = ?, role = ?, university = ?, major = ?, stacks = ?, looking_for = ?, icon_key = ?
     WHERE id = ?`,
    [
      asText(req.body.name, current.name),
      asText(req.body.role, current.role),
      asText(req.body.university, current.university),
      asText(req.body.major, current.major),
      JSON.stringify(req.body.stacks === undefined ? parseJsonArray(current.stacks) : asStringArray(req.body.stacks)),
      asText(req.body.lookingFor ?? req.body.looking_for, current.looking_for),
      asText(req.body.iconKey ?? req.body.icon_key, current.icon_key),
      id,
    ],
  );

  const updatedRows = await selectRows<TeamProfileRow[]>(
    `SELECT id, name, role, university, major, stacks, looking_for, icon_key, created_at, updated_at
     FROM team_profiles
     WHERE id = ?`,
    [id],
  );
  const teamProfile = updatedRows[0];

  if (!teamProfile) {
    throw new Error("Failed to read updated team profile");
  }

  res.json({ teamProfile: mapTeamProfile(teamProfile) });
}));

app.delete("/api/team-profiles/:id", asyncRoute(async (req, res) => {
  const id = getId(req);

  if (!id) {
    res.status(400).json({ error: "Invalid team profile id" });
    return;
  }

  const result = await executeQuery("DELETE FROM team_profiles WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    res.status(404).json({ error: "Team profile not found" });
    return;
  }

  res.status(204).send();
}));

app.post("/api/ai/generate-post", async (req, res) => {
  try {
    const { title, audience, keywords } = req.body;

    if (!title || !audience || !keywords) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      당신은 대학생 커뮤니티(에브리타임, 캠퍼스픽 등)에서 행사나 스터디를 매력적으로 홍보하는 전문 마케터이자 대학생입니다.
      아래의 정보를 바탕으로 대학생들이 참여하고 싶게 만드는 매력적이고 자연스러운 홍보 게시글을 작성해주세요.
      이모지도 적절히 사용하고, 문체는 친근하고 활기차게 해주세요.

      [행사/모임 이름]: ${title}
      [모집 대상]: ${audience}
      [강조할 키워드]: ${keywords}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

app.post("/api/ai/mentoring-match", async (req, res) => {
  try {
    const { worry } = req.body;

    if (!worry) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      당신은 대학생 커뮤니티 'UniLink'의 스마트한 AI 선배 매칭 도우미입니다.
      학생의 다음 취업/학업 고민을 읽고, 이 학생에게 가장 도움이 될 만한 가상의 현직자/선배 멘토 2명을 추천해주세요.
      답변은 친절하고 공감하는 말투로 작성하며, 
      각 멘토에 대해 [이름/직무], [간단한 스펙], [추천하는 이유]를 명확히 제시해주세요.

      [학생의 고민]: ${worry}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ generatedText: response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

app.post("/api/ai/activity-match", async (req, res) => {
  try {
    const { spec } = req.body;

    if (!spec) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      당신은 대학생의 커리어 성장을 돕는 AI 추천 시스템입니다.
      학생의 [학교, 전공, 학년, 목표 직무, 현재 보유 스택/경험]을 보고,
      현재 시점에서 가장 참여하기 좋은 대외활동, 공모전, 혹은 스터디를 3개 추천해주세요.
      답변은 학생에게 직접 말하는 것처럼 친근하게 작성하고, 추천 이유를 논리적으로 설명해주세요.

      [학생 스펙]: ${spec}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ generatedText: response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

app.post("/api/ai/portfolio-feedback", async (req, res) => {
  try {
    const { portfolio } = req.body;

    if (!portfolio) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      당신은 수많은 대학생들의 이력서를 검토해본 IT 기업의 시니어 채용 담당자입니다.
      아래에 주어진 학생의 포트폴리오(또는 이력서) 내용을 읽고, 다음 3가지 관점에서 피드백을 작성해주세요:
      1. [강점]: 이 포트폴리오에서 돋보이는 장점
      2. [보완점]: 아쉽거나 내용이 부족해서 보완해야 할 점
      3. [핵심 조언]: 서류 합격률을 높이기 위한 실질적인 팁

      [포트폴리오 내용]:
      ${portfolio}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ generatedText: response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

app.post("/api/ai/moderate", (req, res) => {
  const content = asText(req.body.content);

  if (!content) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const rules = [
    { pattern: /\b\d{2,3}-\d{3,4}-\d{4}\b/, reason: "전화번호로 보이는 개인정보가 포함되어 있습니다." },
    { pattern: /\b\d{2,6}-\d{2,6}-\d{2,8}\b/, reason: "계좌번호로 보이는 개인정보가 포함되어 있습니다." },
    { pattern: /(카톡|오픈채팅|텔레그램|입금|고수익|보장)/i, reason: "외부 연락 유도 또는 광고성 표현이 포함되어 있습니다." },
    { pattern: /(욕설|혐오|비방|사기)/i, reason: "커뮤니티 운영 정책상 검토가 필요한 표현이 포함되어 있습니다." },
  ];
  const matched = rules.find((rule) => rule.pattern.test(content));

  res.json({
    pass: !matched,
    reason: matched?.reason ?? "커뮤니티 정책 위반 가능성이 낮습니다.",
  });
});

app.post("/api/ai/match-mentor", (_req, res) => {
  res.redirect(307, "/api/ai/mentoring-match");
});

app.post("/api/ai/recommend", (_req, res) => {
  res.redirect(307, "/api/ai/activity-match");
});

app.post("/api/ai/portfolio-review", (_req, res) => {
  res.redirect(307, "/api/ai/portfolio-feedback");
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
