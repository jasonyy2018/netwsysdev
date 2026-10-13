'use client';

import React from 'react';

interface RadarData {
  forehand: number;
  backhand: number;
  serve: number;
  volley: number;
  footwork: number;
  consistency: number;
}

interface HexagonRadarProps {
  data: RadarData;
  size?: number;
}

export function HexagonRadar({ data, size = 320 }: HexagonRadarProps) {
  const center = size / 2;
  const radius = center * 0.75;
  const dimensions = [
    { key: 'forehand', label: '正手击球', val: data.forehand },
    { key: 'serve', label: '发球威力', val: data.serve },
    { key: 'volley', label: '网前截击', val: data.volley },
    { key: 'consistency', label: '连续稳定性', val: data.consistency },
    { key: 'footwork', label: '移动步伐', val: data.footwork },
    { key: 'backhand', label: '反手控制', val: data.backhand },
  ];

  const totalPoints = dimensions.length;

  // 计算圆周各角点坐标
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / totalPoints) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 生成网格层级 (0.2, 0.4, 0.6, 0.8, 1.0)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // 生成多边形路径字符串
  const dataPolygonPoints = dimensions
    .map((dim, i) => {
      const ratio = Math.max(0.1, Math.min(1.0, dim.val / 10.0));
      const pt = getCoordinates(i, ratio);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景环形网格 */}
        {gridLevels.map((lvl) => {
          const pts = dimensions
            .map((_, i) => {
              const pt = getCoordinates(i, lvl);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvl === 1.0 ? '' : '3 3'}
            />
          );
        })}

        {/* 轴线 */}
        {dimensions.map((_, i) => {
          const pt = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={pt.x}
              y2={pt.y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* 实际能力多边形 */}
        <polygon
          points={dataPolygonPoints}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#10b981"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* 数据圆点与数值 */}
        {dimensions.map((dim, i) => {
          const ratio = Math.max(0.1, Math.min(1.0, dim.val / 10.0));
          const pt = getCoordinates(i, ratio);
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#047857"
              stroke="#ffffff"
              strokeWidth="2"
            />
          );
        })}

        {/* 外围文字标签 */}
        {dimensions.map((dim, i) => {
          const labelPt = getCoordinates(i, 1.18);
          return (
            <g key={i}>
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-semibold fill-gray-700"
              >
                {dim.label}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 14}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-bold fill-emerald-600"
              >
                {dim.val.toFixed(1)}分
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
