import { Hairstyle, IHairstyle } from '../models/Hairstyle';

export class HairstyleRepository {
  async findRecommendations(
    faceShape?: string,
    hairTexture?: string,
    hairLength?: string
  ): Promise<IHairstyle[]> {
    const query: any = {};

    if (faceShape) {
      query.faceShapes = faceShape.toLowerCase();
    }
    if (hairTexture) {
      query.hairTexture = hairTexture.toLowerCase();
    }
    if (hairLength) {
      query.hairLength = hairLength.toLowerCase();
    }

    return Hairstyle.find(query);
  }

  async findAll(): Promise<IHairstyle[]> {
    return Hairstyle.find({});
  }
}

export default HairstyleRepository;
