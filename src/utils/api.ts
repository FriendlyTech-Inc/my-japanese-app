interface EnhancedPronResult {
  accuracy: number;
  fluency: number;
  overall: number;
  comment: string;
}

/**
 * 改良版のモック発音評価API。
 * 音素レベルやリズムなどを擬似的に算出し、複数評価項目を返す。
 */
export async function evaluatePronunciationV2(
  audioUri: string,
  correctPhrase: string
): Promise<EnhancedPronResult> {
  // 文字数等から擬似的に3つのスコアを生成
  const lengthFactor = correctPhrase.length * 10; // 文字数×10を目安
  const accuracy = clamp(randomInRange(lengthFactor - 10, lengthFactor + 10), 30, 100);
  const fluency = clamp(randomInRange(lengthFactor - 5, lengthFactor + 15), 30, 100);
  const overall = Math.round((accuracy + fluency) / 2);

  let comment = 'Good job! Keep practicing your pronunciation!';
  if (overall < 50) {
    comment = '発音がやや不明瞭です。少しゆっくり正確に話してみましょう。';
  } else if (overall < 70) {
    comment = 'なかなか良いですが、抑揚をもう少し意識するとより自然になります。';
  } else if (overall < 90) {
    comment = 'かなり良好です！さらに細かいリズムを意識してみてください。';
  } else {
    comment = '完璧に近い発音です！素晴らしいですね。';
  }

  // 遅延演出
  await new Promise((res) => setTimeout(res, 800));

  return { accuracy, fluency, overall, comment };
}

/** 以下、ちょっとした補助関数 */
function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val: number, low: number, high: number) {
  return Math.max(low, Math.min(high, val));
} 