export const AllStudentLevels = ['100', '200', '300', '400'] as const;
export type StudentLevelList = typeof AllStudentLevels;
export type StudentLevel = StudentLevelList[number];

export type Student = {
  id: string;
  firstName?: string;
  lastName?: string;
  otherNames?: string;
  matricNo?: string;
  level?: string;
  courseIds?: string[];
};

export type Lecturer = {
  id: string;
  role: 'lecturer' | 'hod';
  firstName?: string;
  lastName?: string;
  otherNames?: string;
  courses?: Course[];
};

export type Course = {
  id: string;
  code?: string;
  title?: string;
  lecturerId?: string;
  classIds?: string[];
  studentIds?: string[];
};

export type Admin = {
  id: string;
  firstName?: string;
  lastName?: string;
  otherNames?: string;
};

export type NewStudent = Omit<Student, 'id'>;

export type CourseClass = {
  id: string;
  courseId: string;
  date: Date;
  studentIds: string[];
};

export type NewCourse = Omit<Course, 'id'>;

export type ViewState = 'notLoaded' | 'loading' | 'error' | 'success';
