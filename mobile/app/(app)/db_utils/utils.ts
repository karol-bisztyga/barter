import { UserData } from '../types';

export const convertUserData = (userData: Record<string, string>): UserData => {
  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    facebook: userData.facebook,
    instagram: userData.instagram,
    profilePicture: userData.profile_picture,
    location: userData.location,
    verificationCode: userData.verification_code,
    onboarded: userData.onboarded,
  };
};
