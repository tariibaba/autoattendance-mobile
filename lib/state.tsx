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

  get courseList() {
    return this.courseIds.map((id) => this.courses[id]);
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
    const courses = (
      await axios.get(coursesUrl, {
        headers: { Authorization: `Bearer ${this.userSession!.token}` },
      })
    ).data;
    runInAction(() => {
      this.courseIds = [];
      this.courses = {};
      for (let course of courses) {
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
    const data = (
      await axios.get(url, {
        headers: { Authorization: `Bearer ${this.userSession!.token}` },
      })
    ).data;
    console.log(`fetched course info for ${courseId}`);
    console.log(JSON.stringify(data, null, 2));
    this.courses = { ...this.courses, ...{ [data.id]: data } };
    const course = this.courses[courseId] ?? data;
    console.log(`course is now...`);
    console.log(JSON.stringify(course, null, 2));

    course.classIds = [];
    course.studentIds = [];

    let classes;
    if (data.classIds.length > 0) {
      classes = (
        await axios.get(`${API_URL}/classes?courseId=${courseId}`, {
          headers: { Authorization: `Bearer ${this.userSession!.token}` },
        })
      ).data;
    }

    let studentsRes;
    if (data.studentIds.length > 0) {
      console.log(`studentIds: ${data.studentIds}`);
      const studentUrl = `${API_URL}/students?courseId=${courseId}`;
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
        for (let courseClass of classes) {
          if (!this.classIds.includes(courseClass.id)) {
            this.classIds.push(courseClass.id);
          }
          course.classIds!.push(courseClass.id);
          this.classes[courseClass.id] = {
            id: courseClass.id,
            courseId,
            date: new Date(courseClass.date),
            presentIds: [],
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

  async createClass(params: {
    courseId: string;
  }): Promise<CourseClass | undefined> {
    const { courseId } = params;
    const token = this.userSession!.token;
    const date = new Date();
    const { id } = (
      await axios.post(
        `${API_URL}/classes`,
        {
          courseId,
          date: date.toISOString().slice(0, 19).replace('T', ' '),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    ).data;
    const courseClass: CourseClass = {
      courseId,
      id,
      date,
      presentIds: [],
    };
    runInAction(() => {
      this.classIds.push(id);
      this.courses[courseId]!.classIds!.push(id);
      this.classes[id] = courseClass;
    });
    return courseClass;
  }

  async markPresent(attendance: { classId: string; studentId: string }) {
    const { classId, studentId } = attendance;
    const url = `${API_URL}/classes/${classId}/attendances`;
    await axios.post(
      url,
      { studentId },
      { headers: { Authorization: `Bearer ${this.userSession!.token}` } }
    );
    runInAction(() => {
      this.classes[classId].presentIds!.push(studentId);
    });
  }

  async markAbsent(attendance: { classId: string; studentId: string }) {
    const { classId, studentId } = attendance;
    const url = `${API_URL}/classes/${classId}/attendances/${studentId}`;
    await axios.delete(url, {
      headers: { Authorization: `Bearer ${this.userSession!.token}` },
    });
    runInAction(() => {
      const courseClass = this.classes[classId];
      courseClass.presentIds = courseClass.presentIds!.filter(
        (id) => id !== studentId
      );
    });
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
