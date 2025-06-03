export type Role = "student" | "teacher" | "admin";

export type User = {
  id: number;
  username: string;
  role: Role;
};

export type PaginatedResponse = {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type RelatedUsers = {
  students?: User[];
  teacher?: User | null;
};
