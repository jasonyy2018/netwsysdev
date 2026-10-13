-- TennisHub MVP PostgreSQL Database Schema
-- Compatible with pure PostgreSQL 16+ & Supabase

-- 1. Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles (用户档案)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(64) NOT NULL,
    avatar_url TEXT,
    level_num NUMERIC(3,1) NOT NULL DEFAULT 2.0 CHECK (level_num >= 1.0 AND level_num <= 10.0),
    credit_score INT NOT NULL DEFAULT 80 CHECK (credit_score >= 60 AND credit_score <= 100),
    city VARCHAR(64) NOT NULL DEFAULT '上海',
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    play_preference VARCHAR(32) DEFAULT 'both' CHECK (play_preference IN ('singles', 'doubles', 'both')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Assessments (测评记录)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    self_score NUMERIC(3,1) NOT NULL CHECK (self_score >= 1.0 AND self_score <= 10.0),
    ai_score NUMERIC(3,1) CHECK (ai_score >= 1.0 AND ai_score <= 10.0),
    coach_score NUMERIC(3,1) CHECK (coach_score >= 1.0 AND coach_score <= 10.0),
    final_level NUMERIC(3,1) NOT NULL CHECK (final_level >= 1.0 AND final_level <= 10.0),
    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.85 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    radar_forehand NUMERIC(3,1) NOT NULL DEFAULT 3.0,
    radar_backhand NUMERIC(3,1) NOT NULL DEFAULT 3.0,
    radar_serve NUMERIC(3,1) NOT NULL DEFAULT 3.0,
    radar_volley NUMERIC(3,1) NOT NULL DEFAULT 3.0,
    radar_footwork NUMERIC(3,1) NOT NULL DEFAULT 3.0,
    radar_consistency NUMERIC(3,1) NOT NULL DEFAULT 3.0,
    top_improvements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Venues & Courts (场馆与场地)
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    facilities TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    surface VARCHAR(32) NOT NULL DEFAULT 'hard' CHECK (surface IN ('hard', 'clay', 'grass')),
    indoor BOOLEAN NOT NULL DEFAULT false,
    price_cents_per_hour INT NOT NULL DEFAULT 12000, -- 120元/小时以分存储
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Court Slots (时段表 - 防超卖核心)
CREATE TABLE IF NOT EXISTS court_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_hour INT NOT NULL CHECK (start_hour >= 6 AND start_hour <= 23),
    price_cents INT NOT NULL DEFAULT 12000,
    status VARCHAR(32) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'locked', 'booked', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_court_slot UNIQUE (court_id, slot_date, start_hour)
);

-- 6. Bookings (订场订单)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    slot_ids UUID[] NOT NULL,
    amount_cents INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'mock_paid' CHECK (status IN ('pending', 'mock_paid', 'cancelled', 'completed')),
    payment_mock_log JSONB DEFAULT '{"provider": "mock", "paid": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Match Requests (约球需求与匹配)
CREATE TABLE IF NOT EXISTS match_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    city VARCHAR(64) NOT NULL DEFAULT '上海',
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    court_name VARCHAR(128),
    level_min NUMERIC(3,1) NOT NULL DEFAULT 2.0,
    level_max NUMERIC(3,1) NOT NULL DEFAULT 4.0,
    start_time TIMESTAMPTZ NOT NULL,
    slots_needed INT NOT NULL DEFAULT 1, -- 单打招募1人，双打3人
    match_type VARCHAR(32) NOT NULL DEFAULT 'singles' CHECK (match_type IN ('singles', 'doubles', 'rally')),
    cost_mode VARCHAR(32) NOT NULL DEFAULT 'aa' CHECK (cost_mode IN ('aa', 'creator_pays', 'loser_pays')),
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'completed', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_status_start ON match_requests (status, start_time);
CREATE INDEX IF NOT EXISTS idx_match_city_levels ON match_requests (city, level_min, level_max);

-- 8. Match Participants (约球参与者)
CREATE TABLE IF NOT EXISTS match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_request_id UUID NOT NULL REFERENCES match_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'accepted', 'confirmed', 'declined', 'no_show')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_match_participant UNIQUE (match_request_id, user_id)
);

-- 9. Coach Profiles (教练档案与预约)
CREATE TABLE IF NOT EXISTS coach_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coach_level VARCHAR(32) NOT NULL DEFAULT 'junior' CHECK (coach_level IN ('junior', 'middle', 'senior', 'star')),
    years_experience INT NOT NULL DEFAULT 3,
    price_cents_per_hour INT NOT NULL DEFAULT 30000, -- 300元/小时
    rating NUMERIC(2,1) NOT NULL DEFAULT 4.9,
    student_count INT NOT NULL DEFAULT 0,
    specialties TEXT[] DEFAULT ARRAY['入门教学', '正反手纠错']::TEXT[],
    verified BOOLEAN NOT NULL DEFAULT false,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coach_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    hours INT NOT NULL DEFAULT 1,
    amount_cents INT NOT NULL,
    platform_fee_cents INT NOT NULL, -- 5% 平台抽成
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Reviews & Credit Events (评价与信用体系)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(32) NOT NULL CHECK (target_type IN ('player', 'coach', 'court')),
    target_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    delta INT NOT NULL,
    reason VARCHAR(128) NOT NULL,
    ref_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. 插入种子数据 (上海核心场馆与初始球友)
INSERT INTO profiles (id, nickname, avatar_url, level_num, credit_score, city, lat, lng, play_preference)
VALUES 
('11111111-1111-1111-1111-111111111111', '费德勒老球迷 (张明)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 3.5, 95, '上海', 31.230416, 121.473701, 'singles'),
('22222222-2222-2222-2222-222222222222', '李娜小师妹 (王芳)', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 3.0, 90, '上海', 31.240416, 121.483701, 'both'),
('33333333-3333-3333-3333-333333333333', '纳达尔跑动王 (陈强)', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 4.5, 88, '上海', 31.210416, 121.453701, 'singles'),
('44444444-4444-4444-4444-444444444444', '刘教练 (PTR认证)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 5.5, 100, '上海', 31.220416, 121.463701, 'both')
ON CONFLICT (id) DO NOTHING;

INSERT INTO coach_profiles (user_id, coach_level, years_experience, price_cents_per_hour, rating, student_count, specialties, verified, bio)
VALUES
('44444444-4444-4444-4444-444444444444', 'senior', 8, 35000, 4.95, 128, ARRAY['正手强力上旋', '发球纠错', '少儿进阶'], true, '前省队退役选手，PTR专业级教练认证，专注于帮助业余球员从T2跨越至T5。')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO venues (id, name, address, lat, lng, facilities, rating)
VALUES
('aaaa0001-0000-0000-0000-000000000001', '静安网球中心 (常德路馆)', '上海市静安区常德路999号', 31.2355, 121.4421, ARRAY['硬地', '室内恒温', '淋浴更衣', '夜间灯光', '免费停车'], 4.9),
('aaaa0002-0000-0000-0000-000000000002', '徐汇滨江网球俱乐部', '上海市徐汇区龙腾大道3000号', 31.1822, 121.4655, ARRAY['硬地', '红土', '户外江景', '穿线服务'], 4.8),
('aaaa0003-0000-0000-0000-000000000003', '浦东源深体育中心网球场', '上海市浦东新区源深路655号', 31.2338, 121.5362, ARRAY['硬地', '室内', '器材租借'], 4.7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO courts (id, venue_id, name, surface, indoor, price_cents_per_hour)
VALUES
('cccc0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001', '1号硬地场 (中央球场)', 'hard', true, 16000),
('cccc0002-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000001', '2号硬地场', 'hard', true, 14000),
('cccc0003-0000-0000-0000-000000000003', 'aaaa0002-0000-0000-0000-000000000002', '罗兰加洛斯红土场', 'clay', false, 18000)
ON CONFLICT (id) DO NOTHING;
