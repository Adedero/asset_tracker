export interface AuthUser {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  role: "USER" | "ADMIN";
  token?: string;
}
