enum UserRole {
  "user",
  "admin",
}
enum UserStatus {
  "active",
  "inactive",
}

export type User = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};
