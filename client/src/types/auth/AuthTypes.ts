export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  full_name: string;
  email: string;
  password: string;
  profile_image?: string | null;
}

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}