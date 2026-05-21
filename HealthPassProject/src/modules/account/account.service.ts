import type { Gender } from '@prisma/client';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { accountRepository } from './account.repository';
import type { AccountSetupInput, AddFamilyMemberInput, UpdateProfileInput } from './account.schema';

export const accountService = {
  async setupAccount(userId: string, data: AccountSetupInput) {
    if (!config.supportedCities.includes(data.city)) {
      throw new AppError(`Service not available in ${data.city}. Join our waitlist!`, 400);
    }

    const user = await accountRepository.updateUser(userId, {
      name: data.name,
      email: data.email,
      language: data.language,
      city: data.city,
      consentAccepted: data.consentAccepted,
      consentAt: new Date(),
      referralCode: data.referralCode,
      isProfileComplete: true,
    });

    return user;
  },

  async getProfile(userId: string) {
    const user = await accountRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    if (data.city && !config.supportedCities.includes(data.city)) {
      throw new AppError(`Service not available in ${data.city}`, 400);
    }
    return accountRepository.updateUser(userId, data);
  },

  async addFamilyMember(userId: string, data: AddFamilyMemberInput) {
    const count = await accountRepository.countFamilyMembers(userId);
    if (count >= 5) {
      throw new AppError('Family member limit reached. Please upgrade your plan.', 400);
    }
    return accountRepository.addFamilyMember(userId, {
      ...data,
      gender: data.gender as Gender,
    });
  },

  async getFamilyMembers(userId: string) {
    return accountRepository.getFamilyMembers(userId);
  },

  async removeFamilyMember(userId: string, memberId: string) {
    const member = await accountRepository.findFamilyMember(memberId, userId);
    if (!member) throw new AppError('Family member not found', 404);
    await accountRepository.deleteFamilyMember(memberId);
    return { message: 'Family member removed' };
  },
};
