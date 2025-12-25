export type RegisterRequest = {
  action: string;
  username: string;
  password: string;
  email: string;
};

export type LoginRequest = {
  action: 'login',
  username: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  token?: any;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
};

export type UpdateUserRequest = {
  username: string;
  email: string;
  fullName: string;
  description: string;
  avatarId: string;
  updatedAt: string;
};