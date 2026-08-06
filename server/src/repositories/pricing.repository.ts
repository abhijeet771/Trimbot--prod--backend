import { Pricing, IPpricing } from '../models/Pricing';

export class PricingRepository {
  async findByServiceAndTier(serviceId: string, tier: string): Promise<IPpricing | null> {
    return Pricing.findOne({ serviceId, tier, isActive: true });
  }

  async findByService(serviceId: string): Promise<IPpricing[]> {
    return Pricing.find({ serviceId, isActive: true });
  }
}

export default PricingRepository;
