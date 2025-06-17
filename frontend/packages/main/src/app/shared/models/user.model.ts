export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
