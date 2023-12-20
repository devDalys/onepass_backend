export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateRequest {
  name?:string;
  avatarUrl?:string;
  password?:string;
}

export interface SocialLoginRequest {
  social: 'VK' | 'Yandex';
  silence_token: string;
  uuid?: string;
}

export interface VKLoginProps {
  response: VkResponse;
}

export interface VkResponse {
  id: number;
  home_town: string;
  status: string;
  photo_200: string;
  is_service_account: boolean;
  bdate: string;
  is_verified: boolean;
  mail: string;
  account_verification_profile: AccountVerificationProfile;
  verification_status: string;
  promo_verifications: any[];
  has_email_for_binding: boolean;
  has_email_for_binding_banner: boolean;
  first_name: string;
  last_name: string;
  bdate_visibility: number;
  city: City;
  country: City;
  phone: string;
  relation: number;
  screen_name: string;
  sex: number;
}

export interface AccountVerificationProfile {
  first_name: string;
  last_name: string;
  sex: number;
  middle_name: string;
  birthdate: string;
}

export interface City {
  id: number;
  title: string;
}

export interface YandexResponse {
  id: string;
  login: string;
  client_id: string;
  display_name: string;
  real_name: string;
  first_name: string;
  last_name: string;
  sex: string;
  default_email: string;
  emails: string[];
  birthday: string;
  default_avatar_id: string;
  is_avatar_empty: boolean;
  default_phone: DefaultPhone;
  psuid: string;
}

interface DefaultPhone {
  id: number;
  number: string;
}
