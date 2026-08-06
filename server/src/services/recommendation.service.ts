import { HairstyleRepository } from '../repositories/hairstyle.repository';
import { IHairstyle } from '../models/Hairstyle';
import logger from '../utils/logger';

export interface IHairstyleRecommendationResult {
  hairstyle: IHairstyle;
  confidenceScore: number;
  reason: string;
}

export class RecommendationService {
  private hairstyleRepo = new HairstyleRepository();

  async recommendHairstyle(
    faceShape?: string,
    hairTexture?: string,
    hairLength?: string
  ): Promise<IHairstyleRecommendationResult[]> {
    logger.info(`Generating hairstyle recommendations for FaceShape: ${faceShape || 'any'}, Texture: ${hairTexture || 'any'}, Length: ${hairLength || 'any'}`);
    
    // Fetch matching hairstyles
    const candidates = await this.hairstyleRepo.findRecommendations(faceShape, hairTexture, hairLength);
    const results: IHairstyleRecommendationResult[] = [];

    for (const style of candidates) {
      let score = 70; // baseline
      let reasonMatch: string[] = [];

      if (faceShape && style.faceShapes.includes(faceShape.toLowerCase() as any)) {
        score += 15;
        reasonMatch.push(`specifically suits your ${faceShape} face shape`);
      }
      if (hairTexture && style.hairTexture === hairTexture.toLowerCase()) {
        score += 10;
        reasonMatch.push(`works naturally with ${hairTexture} hair texture`);
      }
      if (hairLength && style.hairLength === hairLength.toLowerCase()) {
        score += 5;
        reasonMatch.push(`matches your desired ${hairLength} hair length`);
      }

      if (score > 100) score = 100;

      const reason = reasonMatch.length > 0 
        ? `This style is recommended because it ${reasonMatch.join(' and ')}.`
        : `This is a versatile classic style that works well for a clean, modern look.`;

      results.push({
        hairstyle: style,
        confidenceScore: score,
        reason,
      });
    }

    // Sort by confidence score descending
    return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }
}

export default RecommendationService;
