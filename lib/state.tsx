import axios from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';
import { API_URL } from '../env';
import { readUserSession, createUserSession, UserSession } from './auth';
import {
  Course,
  CourseClass,
  Lecturer,
  NewCourse,
  NewStudent,
  Student,
} from './types';
import { log } from './obj-logger';
import { createContext, useContext, useState } from 'react';

export class AppState {
  courseIds: string[] = [];
  courses: Record<string, Course> = {};
  lecturerIds: string[] = [];
  lecturers: Record<string, Lecturer> = {};
  userSession?: UserSession;
  studentIds: string[] = [];
  students: Record<string, Student> = {};
  classIds: string[] = [];
  classes: Record<string, CourseClass> = {};

  get lecturerList() {
    return this.lecturerIds.map((id) => this.lecturers[id]);
  }

  constructor() {
    makeAutoObservable(this);
  }

  async createUserSession(session: UserSession) {
    await createUserSession(session);
    runInAction(() => {
      this.userSession = session;
    });
  }

  async readUserSession() {
    const session = await readUserSession();
    runInAction(() => {
      this.userSession = session;
    });
  }

  async fetchCourses() {
    const coursesUrl = `${API_URL}/courses`;
    const coursesRes = await axios.get(coursesUrl, {
      headers: { Authorization: `Bearer ${this.userSession!.token}` },
    });
    runInAction(() => {
      this.courseIds = [];
      this.courses = {};
      for (let course of coursesRes.data) {
        this.courseIds.push(course.id);
        this.courses[course.id] = { ...course };
      }
    });
  }

  async fetchLecturerInfo(lecturerId: string): Promise<void> {
    const url = `${API_URL}/lecturers/${lecturerId}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.userSession!.token}` },
    });
    const data = res.data;
    runInAction(() => {
      this.lecturers[lecturerId] = {
        id: lecturerId,
        firstName: data.firstName,
        lastName: data.lastName,
        otherNames: data.otherNames,
        role: data.role,
      };
    });
    const lecturer = this.lecturers[lecturerId];
    console.log(`courseIds: ${data.courseIds}`);
    const coursesUrl = `${API_URL}/courses/?ids=${data.courseIds.join(',')}`;
    const courses =
      data.courseIds.length > 0
        ? (
            await axios.get(coursesUrl, {
              params: { id: data.courseIds },
              headers: { Authorization: `Bearer ${this.userSession!.token}` },
            })
          ).data
        : [];
    console.log('courses...');
    console.log(courses);
    runInAction(() => {
      lecturer.courseIds = [];
      if (data.courseIds.length > 0) {
        for (let course of courses) {
          lecturer.courseIds.push(course.id);
          const { id, title, code, attendanceRate } = course;
          this.courses[course.id] = {
            ...this.courses[course.id],
            id,
            title,
            code,
            attendanceRate,
          };
        }
      }
    });
  }

  async fetchCourseInfo(courseId): Promise<void> {
    const url = `${API_URL}/courses/${courseId}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.userSession!.token}` },
    });
    const data = res.data;
    const course = this.courses[data.id];
    course.classIds = [];
    course.studentIds = [];

    let classesRes;
    if (data.classIds.length > 0) {
      classesRes = await axios.get(
        `${API_URL}/classes?ids=[${data.classIds}]`,
        {
          headers: { Authorization: `Bearer ${this.userSession!.token}` },
        }
      );
    }

    let studentsRes;
    if (data.studentIds.length > 0) {
      const studentUrl = `${API_URL}/students?ids=[${data.studentIds.join(
        ','
      )}]`;
      studentsRes = await axios.get(studentUrl, {
        headers: { Authorization: `Bearer ${this.userSession!.token}` },
      });
    }

    let lecturer;
    if (data.lecturerId) {
      lecturer = (
        await axios.get(`${API_URL}/lecturers/${data.lecturerId}`, {
          headers: { Authorization: `Bearer ${this.userSession!.token}` },
        })
      ).data;
    }

    runInAction(() => {
      if (data.classIds.length > 0) {
        for (let courseClass of classesRes.data) {
          if (!this.classIds.includes(courseClass.id)) {
            this.classIds.push(courseClass.id);
          }
          course.classIds!.push(courseClass.id);
          this.classes[courseClass.id] = {
            id: courseClass.id,
            courseId,
            date: new Date(courseClass.date),
            studentIds: courseClass.studentIds,
          };
        }
      }
      if (data.studentIds.length > 0) {
        for (let student of studentsRes.data) {
          const id = student.id;
          if (!this.studentIds.includes(id)) {
            this.studentIds.push(id);
          }
          course.studentIds!.push(id);
          this.students[id] = { ...this.students[id], ...student };
        }
      }
      if (data.lecturerId) {
        if (!this.lecturerIds.includes(lecturer.id)) {
          this.lecturerIds.push(lecturer.id);
          this.lecturers[lecturer.id] = { ...lecturer };
        }
      }
    });
  }

  async createCourse(course: NewCourse) {
    try {
      const url = `${API_URL}/createCourse`;
      const res = await axios.post(
        url,
        { ...course },
        { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
      );
      const data = res?.data;
      if (data?.success) {
        runInAction(() => {
          this.courseIds.push(data.courseId);
          this.courses[data.courseId] = { id: data.courseId, ...course };
        });
        return { courseId: data.courseId };
      }
    } catch (err) {
      // handle error states
    }
  }

  async updateCourse(course: Course): Promise<void> {
    try {
      const url = `${API_URL}/updateCourse`;
      const res = await axios.post(
        url,
        { ...course },
        { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
      );
      const data = res?.data;
      if (data?.success) {
        const id = data.courseId;
        runInAction(() => {
          this.courses[id] = {
            ...course,
          };
        });
      }
    } catch (err) {
      // handle error states
    }
  }

  async fetchStudents() {
    const url = `${API_URL}/students`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.userSession!.token}` },
    });
    runInAction(() => {
      this.studentIds = [];
      this.students = {};
      for (let student of res.data) {
        this.studentIds.push(student.id);
        this.students[student.id] = student;
      }
    });
  }

  async createStudent(
    student: NewStudent
  ): Promise<{ studentId: string } | undefined> {
    try {
      const url = `${API_URL}/createStudent`;
      const res = await axios.post(
        url,
        { ...student, semester: 1, year: 2022 },
        { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
      );
      const data = res?.data;
      if (data?.success) {
        const id = data.studentId;
        runInAction(() => {
          this.studentIds.push(id);
          this.students[id] = {
            id,
            ...student,
          };
        });
        return { studentId: id };
      }
    } catch (err) {
      // handle error states
    }
  }

  async updateStudent(student: Student): Promise<void> {
    const url = `${API_URL}/updateStudent`;
    try {
      const res = await axios.post(
        url,
        { ...student },
        { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
      );
      const data = res?.data;
      if (data?.success) {
        const id = data.studentId;
        runInAction(() => {
          this.students[id] = {
            ...student,
          };
        });
      }
    } catch (err) {
      // handle error states
    }
  }

  async fetchStudentInfo(studentId: string): Promise<void> {
    const url = `${API_URL}/students/${studentId}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.userSession!.token}` },
    });
    const data = res.data;
    runInAction(() => {
      this.students[studentId] = {
        id: studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        otherNames: data.otherNames,
        matricNo: data.matricNo,
        courseIds: [],
        level: data.level,
      };
    });
    const student = this.students[studentId];
    const coursesUrl = `${API_URL}/courses`;
    let coursesRes;
    if (data.courseIds.length > 0) {
      coursesRes = await axios.get(coursesUrl, {
        params: { id: data.courseIds },
        headers: { Authorization: `Bearer ${this.userSession!.token}` },
      });
    }
    runInAction(() => {
      student.courseIds = [];
      if (data.courseIds.length > 0) {
        for (let course of coursesRes.data) {
          if (!this.courseIds.includes(course.id)) {
            this.courseIds.push(course.id);
          }
          student.courseIds.push(course.id);
          this.courses[course.id] = {
            ...this.courses[course.id],
            id: course.id,
            title: course.title,
            code: course.code,
          };
        }
      }
    });
  }

  async createClass(courseId: string): Promise<CourseClass | undefined> {
    const url = `${API_URL}/createClass`;
    const res = await axios.post(
      url,
      { courseId },
      { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
    );
    const data = res?.data;
    if (data?.success) {
      const courseClass: CourseClass = {
        courseId,
        date: new Date(data.class.date),
        id: data.class.id,
        studentIds: data.class.studentIds,
      };
      runInAction(() => {
        this.classIds.push(data.class.id);
        this.courses[courseId]!.classIds!.push(data.class.id);
        this.classes[data.class.id] = courseClass;
      });
      return courseClass;
    }
  }

  async markPresent(attendance: { classId: string; studentId: string }) {
    const { classId, studentId } = attendance;
    const url = `${API_URL}/markPresent`;
    const res = await axios.post(
      url,
      { ...attendance },
      { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
    );
    const data = res?.data;
    if (data?.success) {
      runInAction(() => {
        this.classes[classId].studentIds.push(studentId);
      });
    }
  }

  async markAbsent(attendance: { classId: string; studentId: string }) {
    const { classId, studentId } = attendance;
    const url = `${API_URL}/markAbsent`;
    const res = await axios.post(
      url,
      { ...attendance },
      { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
    );
    const data = res?.data;
    if (data?.success) {
      runInAction(() => {
        const courseClass = this.classes[classId];
        courseClass.studentIds = courseClass.studentIds.filter(
          (id) => id !== studentId
        );
      });
    }
  }

  async fetchLecturers() {
    const url = `${API_URL}/lecturers`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.userSession!.token}` },
    });
    runInAction(() => {
      this.lecturerIds = [];
      this.lecturers = {};
      for (let lecturer of res.data) {
        this.lecturerIds.push(lecturer.id);
        this.lecturers[lecturer.id] = { ...lecturer };
      }
    });
  }

  get isAdmin(): boolean {
    return this.userSession?.userRole === 'admin';
  }
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider(props: any) {
  const [state, setState] = useState<AppState>(new AppState());

  return (
    <AppStateContext.Provider value={state}>
      {props.children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const appState = useContext(AppStateContext);
  if (!appState) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return appState;
}
