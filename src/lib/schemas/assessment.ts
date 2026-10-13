import { z } from 'zod';

export const AssessmentAnswerSchema = z.object({
  // 12道题目
  q1_experience: z.enum(['under_6m', '6m_1y', '1y_3y', 'over_3y']),
  q2_frequency: z.enum(['monthly', 'weekly_1', 'weekly_2_3', 'weekly_4plus']),
  q3_coaching: z.enum(['self_taught', 'occasional', 'regular', 'professional']),
  q4_forehand_rally: z.enum(['cannot', 'slow_3_5', 'medium_10', 'fast_control']),
  q5_backhand_type: z.enum(['struggle', 'slice_only', 'basic_topspin', 'stable_weapon']),
  q6_serve_consistency: z.enum(['often_double_fault', 'slow_in', 'controllable_speed', 'spin_and_placement']),
  q7_volley: z.enum(['afraid_net', 'block_only', 'punch_volley', 'aggressive_closing']),
  q8_footwork: z.enum(['stand_still', 'slow_recovery', 'split_step_ready', 'explosive_movement']),
  q9_tactics: z.enum(['hit_back_only', 'avoid_errors', 'target_weakness', 'construct_points']),
  q10_match_exp: z.enum(['no_match', 'casual_friendly', 'club_league', 'tournament_ranked']),
  q11_power_control: z.enum(['lack_power', 'power_no_control', 'good_depth', 'power_and_spin_depth']),
  q12_stamina: z.enum(['tired_30m', '1_hour', '2_hours', '3_hours_plus']),
});

export type AssessmentAnswer = z.infer<typeof AssessmentAnswerSchema>;

export interface QuestionDef {
  id: keyof AssessmentAnswer;
  title: string;
  category: string;
  options: { label: string; desc: string; score: number; value: string }[];
}

export const ASSESSMENT_QUESTIONS: QuestionDef[] = [
  // 屏 1: 背景与基础频次
  {
    id: 'q1_experience',
    title: '您的网球球龄大概是多长时间？',
    category: '运动背景',
    options: [
      { label: '初学入门 (< 6个月)', desc: '刚刚接触网球，正在建立击球感觉', score: 1.5, value: 'under_6m' },
      { label: '入坑进阶 (6个月 - 1年)', desc: '能进行简单的基础打球练习', score: 2.2, value: '6m_1y' },
      { label: '稳定球友 (1年 - 3年)', desc: '具备经常打球的习惯与动作定型', score: 3.2, value: '1y_3y' },
      { label: '资深老手 (> 3年)', desc: '球龄较长，具备较成熟的打法和球感', score: 4.2, value: 'over_3y' },
    ],
  },
  {
    id: 'q2_frequency',
    title: '目前平均每周打球/练球频率？',
    category: '运动背景',
    options: [
      { label: '偶尔打 (每月1-2次)', desc: '休闲打球，球感可能容易生疏', score: 1.8, value: 'monthly' },
      { label: '每周 1 次', desc: '周末固定出汗，保持基本手感', score: 2.6, value: 'weekly_1' },
      { label: '每周 2-3 次', desc: '核心网球爱好者，技术增长迅速', score: 3.6, value: 'weekly_2_3' },
      { label: '每周 4 次及以上', desc: '准高强度训练/经常约比赛', score: 4.5, value: 'weekly_4plus' },
    ],
  },
  {
    id: 'q3_coaching',
    title: '是否接受过专业教练规范指导？',
    category: '运动背景',
    options: [
      { label: '纯自学 / 朋友带', desc: '靠看视频或野生摸索击球', score: 1.8, value: 'self_taught' },
      { label: '偶尔上过大班课', desc: '了解基础引拍与握拍，未系统深造', score: 2.5, value: 'occasional' },
      { label: '长期私教规范培训 (10节+)', desc: '动作动力链规范，发力结构标准', score: 3.5, value: 'regular' },
      { label: '专业体校/高水平教练特训', desc: '有系统技战术及体能训练背景', score: 4.8, value: 'professional' },
    ],
  },

  // 屏 2: 底线正手与反手
  {
    id: 'q4_forehand_rally',
    title: '中场中速对拉时，您的正手稳定性如何？',
    category: '底线技术',
    options: [
      { label: '基本无法连续对拉', desc: '经常打飞出界或击球下网', score: 1.5, value: 'cannot' },
      { label: '能慢速连续 3-5 拍', desc: '对方回球舒服时能接回几拍', score: 2.5, value: 'slow_3_5' },
      { label: '能中速稳定对拉 10 拍以上', desc: '正手动作定型，失误率低', score: 3.5, value: 'medium_10' },
      { label: '能快速变线并主动发力进攻', desc: '正手是得分武器，旋转与深度俱佳', score: 4.8, value: 'fast_control' },
    ],
  },
  {
    id: 'q5_backhand_type',
    title: '您的反手击球现状？',
    category: '底线技术',
    options: [
      { label: '反手是明显短板，尽量用正手侧身', desc: '反手碰球容易失控', score: 1.8, value: 'struggle' },
      { label: '主要依靠切削回球过渡', desc: '以防守切削推挡为主', score: 2.8, value: 'slice_only' },
      { label: '具备基本抽球能力，能稳定回过网', desc: '上旋或平抽稳定，落点在深区', score: 3.6, value: 'basic_topspin' },
      { label: '反手可进攻变线，具备强杀伤力', desc: '反手能变直线或大角度撕开防线', score: 4.8, value: 'stable_weapon' },
    ],
  },
  {
    id: 'q6_serve_consistency',
    title: '您的发球稳定性与威力如何？',
    category: '发球技术',
    options: [
      { label: '经常双误，发球全凭运气', desc: '抛球不稳，击球点不稳定', score: 1.5, value: 'often_double_fault' },
      { label: '一发较慢，但基本能轻推入界', desc: '保证发出进区为主，无明显攻击性', score: 2.6, value: 'slow_in' },
      { label: '一发具备一定球速，二发稳定带旋转', desc: '有切削或上旋发球，双误较少', score: 3.6, value: 'controllable_speed' },
      { label: '有明确落点与内角/外角变速控制', desc: '有ACE球或直接发球得分能力', score: 4.8, value: 'spin_and_placement' },
    ],
  },

  // 屏 3: 网前与步伐
  {
    id: 'q7_volley',
    title: '当您上网截击或网前处理球时：',
    category: '网前与截击',
    options: [
      { label: '害怕上网，基本呆在底线', desc: '不敢来到网前截击', score: 1.8, value: 'afraid_net' },
      { label: '只能被动挡球，动作较僵硬', desc: '能够挡回借力球，但容易浮躁下网', score: 2.7, value: 'block_only' },
      { label: '有规范引拍与推截动作，能打到深区', desc: '正反手截击协调，双打能封网', score: 3.7, value: 'punch_volley' },
      { label: '网前截击果断，高压球扣杀极稳', desc: '手感极佳，放短与高压终结能力强', score: 4.8, value: 'aggressive_closing' },
    ],
  },
  {
    id: 'q8_footwork',
    title: '场上的脚步移动与启动反应：',
    category: '移动步法',
    options: [
      { label: '经常站桩打球，追球比较吃力', desc: '缺少垫步准备，击球点往往偏后', score: 1.8, value: 'stand_still' },
      { label: '能跑到位置，但回位较慢', desc: '多拍后容易失位暴露空档', score: 2.6, value: 'slow_recovery' },
      { label: '击球前有分腿垫步（Split Step），回位快', desc: '步点清晰，能及时通过交叉步/侧滑步调整', score: 3.6, value: 'split_step_ready' },
      { label: '爆发力与预判强，覆盖全场大范围', desc: '救险球能力强，移动敏捷持久', score: 4.6, value: 'explosive_movement' },
    ],
  },
  {
    id: 'q9_tactics',
    title: '对局中的比赛战术与心理：',
    category: '实战意识',
    options: [
      { label: '只要把球打过网就行，无战术概念', desc: '纯本能反应式回球', score: 1.8, value: 'hit_back_only' },
      { label: '以控制自身失误为主，求稳至上', desc: '多打中路高深球等待对手失误', score: 2.8, value: 'avoid_errors' },
      { label: '能观察对手弱点（如猛打其反手）', desc: '具备调动对手、压深拉开角度意识', score: 3.8, value: 'target_weakness' },
      { label: '有成熟的得分套路（如发球上网、底线控场压迫）', desc: '临场变阵能力强，关键分冷静', score: 4.8, value: 'construct_points' },
    ],
  },

  // 屏 4: 实战经历与综合
  {
    id: 'q10_match_exp',
    title: '平时的比赛与计分经验？',
    category: '竞赛经验',
    options: [
      { label: '未曾打过正式计分比赛', desc: '平时只练习对拉或娱乐打球', score: 1.8, value: 'no_match' },
      { label: '常和熟人球友打非正式局', desc: '熟悉网球记分规则，胜负心不强', score: 2.8, value: 'casual_friendly' },
      { label: '经常参加业余俱乐部积分赛', desc: '适应不同球风对手，有对抗经验', score: 3.8, value: 'club_league' },
      { label: '常打公开赛/城市业余分站赛', desc: '有正规赛事排名与高压对抗经历', score: 4.8, value: 'tournament_ranked' },
    ],
  },
  {
    id: 'q11_power_control',
    title: '深度击球时的旋转与落点控制：',
    category: '综合球质',
    options: [
      { label: '球速较慢，无法制造旋转', desc: '球质平浅，容易被对手前压', score: 1.8, value: 'lack_power' },
      { label: '能发力抽球，但容易出界失控', desc: '发力与控制之间未能平衡', score: 2.7, value: 'power_no_control' },
      { label: '击球落点深，且能稳定制造上旋弧线', desc: '回球过网高度合理，压迫感良好', score: 3.7, value: 'good_depth' },
      { label: '可随意调控旋转（重上旋/贴地平击/追身）', desc: '穿透力极强，控点精准', score: 4.8, value: 'power_and_spin_depth' },
    ],
  },
  {
    id: 'q12_stamina',
    title: '高强度单打对局下的体能储备：',
    category: '体能储备',
    options: [
      { label: '打 30 分钟后明显感到气喘、动作变形', desc: '体能消耗快，后段失误剧增', score: 2.0, value: 'tired_30m' },
      { label: '能维持 1 小时较好状态', desc: '打完 1 盘后需要较长休息', score: 2.8, value: '1_hour' },
      { label: '能连续进行 2 小时高强度对局', desc: '体能恢复快，技术动作始终保持', score: 3.8, value: '2_hours' },
      { label: '3 小时以上依然移动敏捷，体魄充沛', desc: '极佳的有氧与专项体能支撑', score: 4.6, value: '3_hours_plus' },
    ],
  },
];

/**
 * 根据问卷计算初始分数、T等级和六维雷达
 */
export function calculateAssessmentResult(answers: Record<string, string>) {
  let totalScore = 0;
  let count = 0;

  for (const q of ASSESSMENT_QUESTIONS) {
    const chosenVal = answers[q.id];
    const option = q.options.find((opt) => opt.value === chosenVal);
    if (option) {
      totalScore += option.score;
      count++;
    }
  }

  const avgNtrp = count > 0 ? totalScore / count : 2.5;
  // 映射到 T1-T10
  // NTRP 1.0 -> T1.0, 7.0 -> T10.0
  const levelNum = Math.min(10.0, Math.max(1.0, (avgNtrp - 1.0) * (9.0 / 6.0) + 1.0));
  const roundedLevel = Math.round(levelNum * 10) / 10;

  // 六维计算 (从对应题目提取)
  const forehandScore = getQuestionScore('q4_forehand_rally', answers) * 2;
  const backhandScore = getQuestionScore('q5_backhand_type', answers) * 2;
  const serveScore = getQuestionScore('q6_serve_consistency', answers) * 2;
  const volleyScore = getQuestionScore('q7_volley', answers) * 2;
  const footworkScore = getQuestionScore('q8_footwork', answers) * 2;
  const consistencyScore = getQuestionScore('q11_power_control', answers) * 2;

  const topImprovements: string[] = [];
  if (volleyScore < 6) topImprovements.push('增强网前截击脚下步伐与切推稳定性');
  if (serveScore < 6) topImprovements.push('规范发球动力链抛球点与二发上旋/侧旋');
  if (backhandScore < 6) topImprovements.push('建立反手上旋抽球引拍架构或强化防守切削');
  if (topImprovements.length < 3) topImprovements.push('提升深区对拉时的高弧顶过网余量与体能分配');

  return {
    selfScore: roundedLevel,
    finalLevel: roundedLevel,
    ntrpEstimate: Math.round(avgNtrp * 10) / 10,
    confidence: 0.88,
    radar: {
      forehand: Math.min(10, Math.round(forehandScore * 10) / 10),
      backhand: Math.min(10, Math.round(backhandScore * 10) / 10),
      serve: Math.min(10, Math.round(serveScore * 10) / 10),
      volley: Math.min(10, Math.round(volleyScore * 10) / 10),
      footwork: Math.min(10, Math.round(footworkScore * 10) / 10),
      consistency: Math.min(10, Math.round(consistencyScore * 10) / 10),
    },
    topImprovements: topImprovements.slice(0, 3),
  };
}

function getQuestionScore(qId: string, answers: Record<string, string>): number {
  const q = ASSESSMENT_QUESTIONS.find((item) => item.id === qId);
  if (!q) return 2.5;
  const chosenVal = answers[qId];
  const option = q.options.find((opt) => opt.value === chosenVal);
  return option ? option.score : 2.5;
}
