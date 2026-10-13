/**
 * 纯数学函数：Haversine 地理距离计算 (单位：公里 km)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球平均半径 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export interface CandidateUser {
  id: string;
  nickname: string;
  level_num: number;
  credit_score: number;
  lat?: number;
  lng?: number;
  rating?: number; // 历史评价平均星级 (1-5)
  time_overlap_ratio?: number; // 时间契合比例 (0-1)
}

export interface TargetMatch {
  level_min: number;
  level_max: number;
  target_level: number;
  lat: number;
  lng: number;
}

export interface ScoreBreakdown {
  levelScore: number;
  distanceScore: number;
  timeScore: number;
  creditScore: number;
  reviewScore: number;
  totalScore: number;
  reasons: string[];
}

/**
 * 约球智能匹配核心加权算法 (按方案 6.1 定义落地)
 * 综合分 = 0.40 × 等级契合度 + 0.25 × 距离分 + 0.20 × 时间契合度 + 0.10 × 信用分归一化 + 0.05 × 历史评价分
 */
export function scoreCandidate(
  target: TargetMatch,
  candidate: CandidateUser
): ScoreBreakdown {
  const deltaLevel = Math.abs(candidate.level_num - target.target_level);
  
  // 等级契合度 = max(0, 1 - max(0, |Δlevel| - 0.5) / 2.0)
  const levelScore = Math.max(0, 1 - Math.max(0, deltaLevel - 0.5) / 2.0);

  // 距离分 = max(0, 1 - distance_km / 15)
  let distanceKm = 5.0; // 默认平均距离兜底
  if (candidate.lat && candidate.lng) {
    distanceKm = calculateDistanceKm(target.lat, target.lng, candidate.lat, candidate.lng);
  }
  const distanceScore = Math.max(0, 1 - distanceKm / 15);

  // 时间契合度 (0 - 1)
  const timeScore = candidate.time_overlap_ratio ?? 0.8;

  // 信用分归一化 = (credit_score - 60) / 40
  const creditScore = Math.max(0, Math.min(1, (candidate.credit_score - 60) / 40));

  // 历史评价分 = avg(近10条星级) / 5
  const reviewScore = Math.max(0, Math.min(1, (candidate.rating ?? 4.8) / 5));

  // 加权合计
  const totalScore =
    0.40 * levelScore +
    0.25 * distanceScore +
    0.20 * timeScore +
    0.10 * creditScore +
    0.05 * reviewScore;

  const reasons: string[] = [];
  if (deltaLevel <= 0.5) {
    reasons.push('等级极度匹配');
  } else if (deltaLevel <= 1.0) {
    reasons.push('水平相当');
  }

  if (distanceKm <= 3.0) {
    reasons.push(`同在 ${distanceKm}km 范围内`);
  } else if (distanceKm <= 8.0) {
    reasons.push(`同城 ${distanceKm}km 快速到达`);
  }

  if (candidate.credit_score >= 90) {
    reasons.push('极佳信用认证');
  }

  return {
    levelScore: Math.round(levelScore * 100) / 100,
    distanceScore: Math.round(distanceScore * 100) / 100,
    timeScore: Math.round(timeScore * 100) / 100,
    creditScore: Math.round(creditScore * 100) / 100,
    reviewScore: Math.round(reviewScore * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
    reasons,
  };
}
