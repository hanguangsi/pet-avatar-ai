const abnormalWords = ["吐", "呕", "血", "拉稀", "腹泻", "不吃", "没精神", "发烧", "咳", "疼", "异常"];

export function calculateHealthScore(input: {
  water?: string | null;
  exercise?: string | null;
  poop?: string | null;
  note?: string | null;
  hasRecord?: boolean;
}) {
  let score = 100;
  if (input.hasRecord === false) score -= 10;
  if (input.water && ["少", "不足", "很少"].some((word) => input.water?.includes(word))) score -= 5;
  if (input.exercise && ["少", "未", "没有", "不足"].some((word) => input.exercise?.includes(word))) score -= 5;
  if (input.poop && ["稀", "硬", "血", "未", "没有", "异常"].some((word) => input.poop?.includes(word))) score -= 10;
  if (input.note && abnormalWords.some((word) => input.note?.includes(word))) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function healthStatus(score: number) {
  if (score >= 90) return "优秀";
  if (score >= 70) return "正常";
  if (score >= 50) return "关注";
  return "建议观察";
}
