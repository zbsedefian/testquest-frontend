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

export type Classroom = {
  id: number;
  name: string;
  teachers: User[];
  students: User[];
  total_students: number;
};

export interface Test {
  id: number;
  name: string;
  created_by: number;
}

export type ClassroomWithUsers = {
  classroom: Classroom;
  teachers: User[];
  students: User[];
};