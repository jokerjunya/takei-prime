/**
 * 職種関連のユーティリティ関数
 */

import type { TargetRole } from './types'

// 職種の日本語表示名
export const ROLE_LABELS: Record<TargetRole, string> = {
  engineer: 'エンジニア',
  sales: 'セールス',
  marketing: 'マーケティング',
  design: 'デザイン',
  product: 'プロダクト',
  customer_success: 'カスタマーサクセス',
  corporate: 'コーポレート'
}

// 職種のアイコン
export const ROLE_ICONS: Record<TargetRole, string> = {
  engineer: '💻',
  sales: '💼',
  marketing: '📢',
  design: '🎨',
  product: '📊',
  customer_success: '🤝',
  corporate: '🏢'
}

// 職種の色（Tailwind class）
export const ROLE_COLORS: Record<TargetRole, {
  bg: string
  text: string
  border: string
}> = {
  engineer: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300'
  },
  sales: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300'
  },
  marketing: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300'
  },
  design: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-300'
  },
  product: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-300'
  },
  customer_success: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-300'
  },
  corporate: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300'
  }
}

export function getRoleLabel(role: TargetRole): string {
  return ROLE_LABELS[role]
}

export function getRoleIcon(role: TargetRole): string {
  return ROLE_ICONS[role]
}

export function getRoleColors(role: TargetRole) {
  return ROLE_COLORS[role]
}

