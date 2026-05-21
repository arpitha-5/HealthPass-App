import { AppError } from '../../utils/AppError';
import { plansRepository } from './plans.repository';

export const plansService = {
  async getAllPlans() {
    return plansRepository.findAllActive();
  },

  async getPlanById(id: string) {
    const plan = await plansRepository.findById(id);
    if (!plan) throw new AppError('Plan not found', 404);
    return plan;
  },
};
