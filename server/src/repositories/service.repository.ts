import { Service, IService } from '../models/Service';

export class ServiceRepository {
  async findById(id: string): Promise<IService | null> {
    return Service.findById(id);
  }

  async findAllActive(): Promise<IService[]> {
    return Service.find({ isActive: true });
  }

  async findByName(name: string): Promise<IService | null> {
    return Service.findOne({
      name: { $regex: new RegExp(name.trim(), 'i') },
      isActive: true,
    });
  }

  async findManyByNames(names: string[]): Promise<IService[]> {
    const regexes = names.map(name => new RegExp(name.trim(), 'i'));
    return Service.find({
      name: { $in: regexes },
      isActive: true,
    });
  }

  async findManyByIds(ids: string[]): Promise<IService[]> {
    return Service.find({
      _id: { $in: ids },
      isActive: true,
    });
  }
}

export default ServiceRepository;
