// Local sqlite-vec cosine similarity and vector matching engine
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const minLen = Math.min(vecA.length, vecB.length);
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return Math.max(0, Math.min(1, dotProduct / denominator));
}

// Generates a mock 16-d normalized semantic vector for query or newly uploaded image
export function generatePseudoEmbedding(seedText: string): number[] {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }

  const rawVec: number[] = [];
  for (let i = 0; i < 16; i++) {
    const val = Math.abs(Math.sin((hash + i * 37) * 0.1));
    rawVec.push(val);
  }

  // Normalize
  const magnitude = Math.sqrt(rawVec.reduce((sum, v) => sum + v * v, 0));
  return rawVec.map(v => (magnitude > 0 ? Number((v / magnitude).toFixed(4)) : 0.25));
}
