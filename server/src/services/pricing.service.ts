import { ServiceRepository } from '../repositories/service.repository';
import { PricingRepository } from '../repositories/pricing.repository';
import logger from '../utils/logger';

export interface IPricingDetails {
  serviceName: string;
  category: string;
  durationMinutes: number;
  basePrice: number;
  discountPercentage: number;
  finalPriceBeforeTax: number;
  taxAmount: number;
  finalPrice: number;
  notes?: string;
}

export class PricingService {
  private serviceRepo = new ServiceRepository();
  private pricingRepo = new PricingRepository();

  async pricingLookup(serviceName?: string, tier: 'standard' | 'student' | 'member' | 'premium' = 'standard'): Promise<IPricingDetails[]> {
    logger.info(`Looking up pricing for serviceName: ${serviceName || 'all'}, tier: ${tier}`);
    
    // 1. Fetch matching services
    let services = [];
    if (serviceName) {
      const match = await this.serviceRepo.findByName(serviceName);
      services = match ? [match] : [];
    } else {
      services = await this.serviceRepo.findAllActive();
    }

    const results: IPricingDetails[] = [];

    // 2. Compute price for each service
    for (const service of services) {
      let discountPercentage = 0;
      let taxPercentage = 10; // default JPY tax
      let priceOverride = service.price;
      let notes = '';

      if (tier !== 'standard') {
        const pricingOverride = await this.pricingRepo.findByServiceAndTier(service._id.toString(), tier);
        if (pricingOverride) {
          discountPercentage = pricingOverride.discountPercentage || 0;
          taxPercentage = pricingOverride.taxPercentage ?? 10;
          if (pricingOverride.priceOverride !== undefined) {
            priceOverride = pricingOverride.priceOverride;
          }
          notes = pricingOverride.notes || '';
        }
      }

      // Calculate totals
      const discountValue = priceOverride * (discountPercentage / 100);
      const finalPriceBeforeTax = priceOverride - discountValue;
      const taxAmount = finalPriceBeforeTax * (taxPercentage / 100);
      const finalPrice = Math.round(finalPriceBeforeTax + taxAmount);

      results.push({
        serviceName: service.name,
        category: service.category,
        durationMinutes: service.durationMinutes,
        basePrice: service.price,
        discountPercentage,
        finalPriceBeforeTax,
        taxAmount,
        finalPrice,
        notes: notes || undefined,
      });
    }

    return results;
  }
}

export default PricingService;
