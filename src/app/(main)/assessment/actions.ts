'use server';

import { query } from '@/lib/db';
import { AssessmentAnswerSchema, calculateAssessmentResult } from '@/lib/schemas/assessment';
import { revalidatePath } from 'next/cache';

// 临时默认演示用户ID (若未做登录体系，使用种子库真实用户)
const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

export async function submitSelfAssessment(formData: Record<string, string>) {
  try {
    const validated = AssessmentAnswerSchema.parse(formData);
    const result = calculateAssessmentResult(validated);

    // 1. 写入 assessments 表
    const insertRes = await query(
      `INSERT INTO assessments 
        (user_id, self_score, final_level, confidence, 
         radar_forehand, radar_backhand, radar_serve, radar_volley, radar_footwork, radar_consistency, 
         top_improvements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        DEFAULT_USER_ID,
        result.selfScore,
        result.finalLevel,
        result.confidence,
        result.radar.forehand,
        result.radar.backhand,
        result.radar.serve,
        result.radar.volley,
        result.radar.footwork,
        result.radar.consistency,
        JSON.stringify(result.topImprovements),
      ]
    );

    // 2. 同步更新 profiles 用户的主等级
    await query(
      `UPDATE profiles SET level_num = $1, updated_at = NOW() WHERE id = $2`,
      [result.finalLevel, DEFAULT_USER_ID]
    );

    revalidatePath('/assessment/result');
    revalidatePath('/');

    return {
      success: true,
      assessmentId: insertRes.rows[0].id,
      data: result,
    };
  } catch (error) {
    console.error('Failed to submit assessment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '提交问卷失败，请重试',
    };
  }
}

export async function getLatestAssessment(userId = DEFAULT_USER_ID) {
  try {
    const res = await query(
      `SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      selfScore: Number(row.self_score),
      aiScore: row.ai_score ? Number(row.ai_score) : null,
      coachScore: row.coach_score ? Number(row.coach_score) : null,
      finalLevel: Number(row.final_level),
      confidence: Number(row.confidence),
      radar: {
        forehand: Number(row.radar_forehand),
        backhand: Number(row.radar_backhand),
        serve: Number(row.radar_serve),
        volley: Number(row.radar_volley),
        footwork: Number(row.radar_footwork),
        consistency: Number(row.radar_consistency),
      },
      topImprovements: Array.isArray(row.top_improvements)
        ? row.top_improvements
        : typeof row.top_improvements === 'string'
        ? JSON.parse(row.top_improvements)
        : [],
      createdAt: row.created_at,
    };
  } catch (error) {
    console.error('Get assessment error:', error);
    return null;
  }
}
