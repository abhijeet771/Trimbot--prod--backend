import { Offer, IOffer } from '../models/Offer';

export class OfferRepository {
  async findByCode(code: string): Promise<IOffer | null> {
    return Offer.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      activeFrom: { $lte: new Date() },
      activeTo: { $gte: new Date() },
    });
  }

  async findAllActive(): Promise<IOffer[]> {
    return Offer.find({
      isActive: true,
      activeFrom: { $lte: new Date() },
      activeTo: { $gte: new Date() },
    });
  }
}

export default OfferRepository;
