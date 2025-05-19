export type RegisterRequest = {
  action: string;
  username: string;
  password: string;
  email: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token?: string;
};
