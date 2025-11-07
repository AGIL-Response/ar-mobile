export type User = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  emailVerified: boolean;
  createdAt: number;
  enabled: boolean;
  roles: Role[];
  avatarId?: string;
  description?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  status?: string;
  attributes?: {
    networkMbps?: number;
    batteryPercentage?: number;
  };
};

export type Role = {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
};

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  attributes?: Record<string, string[]>;
};

export type UsersQueryParams = {
  offset?: number;
  limit?: number;
  search?: string;
  sort?: string;
};

export type UsersResponse = {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
};

export interface TeamMemberResponse {
  tenantId: string;
  teamId: string;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  id: string;
  idpUserId: string;
  username: string;
  email: string;
  fullName: string;
  avatarId?: string;
  description?: string;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  location?: {
    type: string;
    coordinates: number[];
  };
}

export interface ApiResponse<T> {
  data: T;
}
