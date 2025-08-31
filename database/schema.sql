-- Asterasys Marketing Intelligence Database Schema
-- 실제 CSV 데이터 기반 18개 제품 정확 매핑
-- 데이터 무결성 가이드라인 준수

-- Technology Groups (기술 분류)
CREATE TABLE technology_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- '고주파', '초음파'
  name_eng VARCHAR(50) NOT NULL, -- 'RF', 'HIFU'
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Devices (18개 정확한 제품 - 실제 CSV 검증됨)
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_eng VARCHAR(100),
  technology_group_id INTEGER REFERENCES technology_groups(id),
  is_asterasys BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 999,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name)
);

-- Rankings (실제 CSV 데이터 저장용)
CREATE TABLE rankings (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id),
  ranking_type VARCHAR(50) NOT NULL, -- 'blog_rank', 'cafe_rank', 'news_rank', 'youtube_rank', 'sale'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Blog 관련 데이터
  blog_volume INTEGER DEFAULT 0,
  blog_rank INTEGER,
  blog_hospital_posts INTEGER DEFAULT 0,
  blog_place_posts INTEGER DEFAULT 0,
  blog_general_posts INTEGER DEFAULT 0,
  blog_comments INTEGER DEFAULT 0,
  blog_replies INTEGER DEFAULT 0,
  
  -- Cafe 관련 데이터  
  cafe_volume INTEGER DEFAULT 0,
  cafe_rank INTEGER,
  cafe_comments INTEGER DEFAULT 0,
  cafe_replies INTEGER DEFAULT 0,
  cafe_views INTEGER DEFAULT 0,
  
  -- Sales 데이터
  sales_volume INTEGER DEFAULT 0,
  
  -- YouTube 데이터
  youtube_volume INTEGER DEFAULT 0,
  youtube_rank INTEGER,
  
  -- News 데이터
  news_volume INTEGER DEFAULT 0,
  news_rank INTEGER,
  
  -- 원본 데이터 보관
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 필수 기술 그룹 데이터 입력
INSERT INTO technology_groups (id, name, name_eng, display_name) VALUES
(1, '고주파', 'RF', 'RF (Radio Frequency)'),
(2, '초음파', 'HIFU', 'HIFU (High-Intensity Focused Ultrasound)');

-- 18개 제품 정확한 데이터 입력 (실제 CSV 검증 완료)
INSERT INTO devices (name, name_eng, technology_group_id, is_asterasys, display_order) VALUES
-- 고주파(RF) 제품 - 9개 (실제 CSV 데이터 기준)
('쿨페이즈', 'CoolPhase', 1, TRUE, 1),   -- Asterasys RF 제품
('써마지', 'Thermage', 1, FALSE, 2),
('인모드', 'InMode', 1, FALSE, 3), 
('올리지오', 'Oligio', 1, FALSE, 4),
('덴서티', 'Densiti', 1, FALSE, 5),
('볼뉴머', 'Volnumer', 1, FALSE, 6),
('세르프', 'SERF', 1, FALSE, 7),
('텐써마', 'TenseTherma', 1, FALSE, 8),
('튠페이스', 'TuneFace', 1, FALSE, 9),

-- 초음파(HIFU) 제품 - 9개 (실제 CSV 데이터 기준)  
('리프테라', 'Liftera', 2, TRUE, 10),    -- Asterasys HIFU 제품
('쿨소닉', 'CoolSonic', 2, TRUE, 11),    -- Asterasys HIFU 제품
('울쎄라', 'Ulthera', 2, FALSE, 12),
('슈링크', 'Shurink', 2, FALSE, 13),
('리니어지', 'LinearG', 2, FALSE, 14),
('리니어펌', 'LinearFirm', 2, FALSE, 15),
('텐쎄라', 'Tensera', 2, FALSE, 16), 
('브이로', 'V-RO', 2, FALSE, 17),
('튠라이너', 'TuneLiner', 2, FALSE, 18);

-- 실제 CSV 데이터 입력 (2025년 8월)
-- Blog Rank 데이터 (blog_rank.csv 기준)
INSERT INTO rankings (device_id, ranking_type, period_start, period_end, blog_volume, blog_rank, blog_hospital_posts, blog_comments, blog_replies) VALUES
-- RF 제품들
((SELECT id FROM devices WHERE name = '인모드'), 'blog_rank', '2025-08-01', '2025-08-31', 941, 1, 130, 580, 85),
((SELECT id FROM devices WHERE name = '써마지'), 'blog_rank', '2025-08-01', '2025-08-31', 928, 2, 163, 231, 20),
((SELECT id FROM devices WHERE name = '올리지오'), 'blog_rank', '2025-08-01', '2025-08-31', 299, 3, 146, 349, 1),
((SELECT id FROM devices WHERE name = '덴서티'), 'blog_rank', '2025-08-01', '2025-08-31', 203, 4, 93, 224, 32),
((SELECT id FROM devices WHERE name = '볼뉴머'), 'blog_rank', '2025-08-01', '2025-08-31', 175, 5, 56, 284, 18),
((SELECT id FROM devices WHERE name = '세르프'), 'blog_rank', '2025-08-01', '2025-08-31', 139, 6, 73, 71, 11),
((SELECT id FROM devices WHERE name = '텐써마'), 'blog_rank', '2025-08-01', '2025-08-31', 122, 7, 58, 187, 3),
((SELECT id FROM devices WHERE name = '튠페이스'), 'blog_rank', '2025-08-01', '2025-08-31', 106, 8, 26, 40, 0),
((SELECT id FROM devices WHERE name = '쿨페이즈'), 'blog_rank', '2025-08-01', '2025-08-31', 38, 9, 18, 2, 0),

-- HIFU 제품들 (blog_rank.csv에서 확인된 것만)
((SELECT id FROM devices WHERE name = '리프테라'), 'blog_rank', '2025-08-01', '2025-08-31', 63, 6, 53, 16, 2),
((SELECT id FROM devices WHERE name = '쿨소닉'), 'blog_rank', '2025-08-01', '2025-08-31', 13, 8, 12, 3, 0);

-- Cafe Rank 데이터 (cafe_rank.csv 기준)
INSERT INTO rankings (device_id, ranking_type, period_start, period_end, cafe_volume, cafe_rank, cafe_comments, cafe_replies, cafe_views) VALUES
-- RF 제품들
((SELECT id FROM devices WHERE name = '써마지'), 'cafe_rank', '2025-08-01', '2025-08-31', 544, 1, 3477, 934, 40201),
((SELECT id FROM devices WHERE name = '인모드'), 'cafe_rank', '2025-08-01', '2025-08-31', 328, 2, 1731, 472, 26515),
((SELECT id FROM devices WHERE name = '덴서티'), 'cafe_rank', '2025-08-01', '2025-08-31', 239, 3, 941, 185, 20994),
((SELECT id FROM devices WHERE name = '쿨페이즈'), 'cafe_rank', '2025-08-01', '2025-08-31', 220, 4, 1670, 232, 12558),
((SELECT id FROM devices WHERE name = '올리지오'), 'cafe_rank', '2025-08-01', '2025-08-31', 77, 5, 532, 141, 5032),
((SELECT id FROM devices WHERE name = '튠페이스'), 'cafe_rank', '2025-08-01', '2025-08-31', 67, 6, 548, 153, 5543),
((SELECT id FROM devices WHERE name = '세르프'), 'cafe_rank', '2025-08-01', '2025-08-31', 42, 7, 255, 77, 4929),
((SELECT id FROM devices WHERE name = '텐써마'), 'cafe_rank', '2025-08-01', '2025-08-31', 42, 8, 238, 93, 5448),
((SELECT id FROM devices WHERE name = '볼뉴머'), 'cafe_rank', '2025-08-01', '2025-08-31', 26, 9, 159, 54, 2068),

-- HIFU 제품들
((SELECT id FROM devices WHERE name = '울쎄라'), 'cafe_rank', '2025-08-01', '2025-08-31', 531, 1, 2885, 696, 31264),
((SELECT id FROM devices WHERE name = '슈링크'), 'cafe_rank', '2025-08-01', '2025-08-31', 256, 2, 1722, 469, 23319),
((SELECT id FROM devices WHERE name = '쿨소닉'), 'cafe_rank', '2025-08-01', '2025-08-31', 230, 3, 1813, 252, 9899),
((SELECT id FROM devices WHERE name = '리프테라'), 'cafe_rank', '2025-08-01', '2025-08-31', 202, 4, 1530, 210, 12948),
((SELECT id FROM devices WHERE name = '리니어지'), 'cafe_rank', '2025-08-01', '2025-08-31', 100, 5, 134, 13, 8321),
((SELECT id FROM devices WHERE name = '브이로'), 'cafe_rank', '2025-08-01', '2025-08-31', 37, 6, 336, 55, 2971),
((SELECT id FROM devices WHERE name = '텐쎄라'), 'cafe_rank', '2025-08-01', '2025-08-31', 23, 7, 121, 25, 1009),
((SELECT id FROM devices WHERE name = '튠라이너'), 'cafe_rank', '2025-08-01', '2025-08-31', 22, 8, 98, 47, 3082),
((SELECT id FROM devices WHERE name = '리니어펌'), 'cafe_rank', '2025-08-01', '2025-08-31', 1, 9, 4, 0, 9);

-- Sales 데이터 (sale.csv 기준)
INSERT INTO rankings (device_id, ranking_type, period_start, period_end, sales_volume) VALUES
-- HIFU 제품들
((SELECT id FROM devices WHERE name = '슈링크'), 'sale', '2025-08-01', '2025-08-31', 1732),
((SELECT id FROM devices WHERE name = '리프테라'), 'sale', '2025-08-01', '2025-08-31', 492),
((SELECT id FROM devices WHERE name = '브이로'), 'sale', '2025-08-01', '2025-08-31', 443),
((SELECT id FROM devices WHERE name = '텐쎄라'), 'sale', '2025-08-01', '2025-08-31', 416),
((SELECT id FROM devices WHERE name = '리니어펌'), 'sale', '2025-08-01', '2025-08-31', 402),
((SELECT id FROM devices WHERE name = '리니어지'), 'sale', '2025-08-01', '2025-08-31', 398),
((SELECT id FROM devices WHERE name = '튠라이너'), 'sale', '2025-08-01', '2025-08-31', 325),
((SELECT id FROM devices WHERE name = '쿨소닉'), 'sale', '2025-08-01', '2025-08-31', 23),

-- RF 제품들  
((SELECT id FROM devices WHERE name = '쿨페이즈'), 'sale', '2025-08-01', '2025-08-31', 159);

-- 데이터 검증 쿼리
-- 18개 제품 확인
SELECT COUNT(*) as total_devices FROM devices; -- 결과: 18

-- Asterasys 제품 확인 (3개)
SELECT d.name, tg.name as technology, d.is_asterasys 
FROM devices d 
JOIN technology_groups tg ON d.technology_group_id = tg.id 
WHERE d.is_asterasys = TRUE
ORDER BY d.display_order;

-- 기술별 제품 수 확인
SELECT tg.name, COUNT(d.id) as product_count
FROM technology_groups tg
LEFT JOIN devices d ON tg.id = d.technology_group_id
GROUP BY tg.id, tg.name
ORDER BY tg.id;

-- 실제 CSV 데이터 검증
SELECT 
    d.name,
    tg.name as technology,
    r.cafe_volume,
    r.cafe_rank,
    r.blog_volume,
    r.blog_rank,
    r.sales_volume
FROM devices d
JOIN technology_groups tg ON d.technology_group_id = tg.id
LEFT JOIN rankings r ON d.id = r.device_id
WHERE d.is_asterasys = TRUE
ORDER BY d.display_order;