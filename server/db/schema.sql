CREATE DATABASE IF NOT EXISTS aingthons
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE aingthons;

CREATE TABLE IF NOT EXISTS contests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  organizer VARCHAR(120) NOT NULL DEFAULT '',
  deadline DATE NULL,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  category VARCHAR(80) NOT NULL DEFAULT 'general',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_contests_deadline (deadline),
  INDEX idx_contests_category (category)
);

CREATE TABLE IF NOT EXISTS recruitments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  kind VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(120) NOT NULL DEFAULT '',
  schedule VARCHAR(120) NOT NULL DEFAULT '',
  location VARCHAR(120) NOT NULL DEFAULT '',
  current_members INT UNSIGNED NOT NULL DEFAULT 0,
  max_members INT UNSIGNED NOT NULL DEFAULT 1,
  tags JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_recruitments_kind (kind)
);

CREATE TABLE IF NOT EXISTS team_profiles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  role VARCHAR(120) NOT NULL DEFAULT '',
  university VARCHAR(120) NOT NULL DEFAULT '',
  major VARCHAR(120) NOT NULL DEFAULT '',
  stacks JSON NOT NULL,
  looking_for VARCHAR(500) NOT NULL DEFAULT '',
  icon_key VARCHAR(40) NOT NULL DEFAULT 'code',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_team_profiles_role (role)
);

INSERT INTO contests (id, title, organizer, deadline, views, image_url, category)
VALUES
  (1, '2026 글로벌 이노베이션 아이디어 공모전', 'Global Research', '2026-07-08', 1946, 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400&h=400', 'idea'),
  (2, '공공데이터 AI 활용 공모전', '고용노동부', '2026-05-14', 2995, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=400', 'data'),
  (3, '메이커스 해커톤 2026', '메이커스 코리아', '2026-05-11', 1822, 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=400&h=400', 'hackathon'),
  (4, '산업안전보건 조사자료 논문 경진대회', '안전보건공단', '2026-05-31', 2032, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400&h=400', 'research'),
  (5, '에너지 감축 아이디어 경진대회', '한국전력공사', '2026-05-10', 1268, 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80&w=400&h=400', 'idea')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  organizer = VALUES(organizer),
  deadline = VALUES(deadline),
  views = VALUES(views),
  image_url = VALUES(image_url),
  category = VALUES(category);

INSERT INTO recruitments (id, kind, title, subject, schedule, location, current_members, max_members, tags)
VALUES
  (1, 'study', 'React + TypeScript 기초 스터디원 모집', '프론트엔드', '매주 목요일 19:00', '강남 스터디룸', 3, 6, JSON_ARRAY('React', 'TypeScript', '초보환영')),
  (2, 'study', '알고리즘 코딩테스트 반 모집', '알고리즘', '주 2회 온라인 20:00', 'Discord', 2, 4, JSON_ARRAY('Python', '백준', '프로그래머스')),
  (3, 'club', 'IT 연합 창업 동아리 SOPT 34기 모집', '기획/디자인/개발', '매주 토요일 세션', '서울 주요 대학', 40, 100, JSON_ARRAY('연합동아리', '스타트업', '프로젝트'))
ON DUPLICATE KEY UPDATE
  kind = VALUES(kind),
  title = VALUES(title),
  subject = VALUES(subject),
  schedule = VALUES(schedule),
  location = VALUES(location),
  current_members = VALUES(current_members),
  max_members = VALUES(max_members),
  tags = VALUES(tags);

INSERT INTO team_profiles (id, name, role, university, major, stacks, looking_for, icon_key)
VALUES
  (1, '김개발', '프론트엔드', '한양대학교', '컴퓨터소프트웨어학부', JSON_ARRAY('React', 'TypeScript', 'Next.js'), '해커톤 프로젝트 팀원을 구합니다.', 'code'),
  (2, '김유진', 'UI/UX 디자이너', '홍익대학교', '시각디자인학과', JSON_ARRAY('Figma', 'Protopie', 'Illustrator'), '포트폴리오용 사이드 프로젝트를 함께 만들 팀을 찾고 있어요.', 'palette'),
  (3, '박기획', '서비스 기획자', '고려대학교', '경영학과', JSON_ARRAY('Notion', 'Jira', 'Figma'), 'IT 창업 동아리나 MVP 프로젝트에 참여하고 싶습니다.', 'briefcase')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role),
  university = VALUES(university),
  major = VALUES(major),
  stacks = VALUES(stacks),
  looking_for = VALUES(looking_for),
  icon_key = VALUES(icon_key);
