export type Role = "student" | "teacher" | "admin";

export type User = {
  id: number;
  username: string;
  password?: string; // Optional in TS, only used when creating
  role: "admin" | "teacher" | "student";
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string; // ISO string format in TS
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

export type ClassroomWithUsers = {
  classroom: Classroom;
  teachers: User[];
  students: User[];
};

export interface ClassroomWithStudents {
  classroom_id: number;
  classroom_name: string;
  students: User[];
}

export interface Test {
  id: number;
  name: string;
  description: string;
  created_by: number;

  is_timed: boolean;
  duration_minutes?: number;
  max_attempts: number;

  available_from?: string; // ISO datetime string
  available_until?: string;
  is_published: boolean;

  show_results_immediately: boolean;
  allow_back_navigation: boolean;
  shuffle_questions: boolean;
  pass_score?: number;
  graded_by: "auto" | "manual";
  created_at: string; // ISO datetime string
}

export interface Question {
  id: number;
  test_id: number;
  order: number;
  question_text: string;
  choices: Record<string, string>; // parsed JSON object like { A: "Option A", B: "Option B", ... }
  correct_choice: string;
  explanation: string;
  requires_manual_grading: boolean;
  image_url: string;
}

export interface RawQuestion {
  id: number;
  test_id: number;
  order: number;
  question_text: string;
  choices: string; // raw JSON string
  correct_choice: string;
  explanation: string;
}

export interface TestWithQuestions {
  id: number;
  name: string;
  duration_minutes: number | null;
  is_timed: boolean;
  questions: Question[];
}