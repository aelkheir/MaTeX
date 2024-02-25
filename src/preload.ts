// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { Course, Lesson, Question, Unit } from "./main/entities";

export type Channels = "ipc-example";

const electronHandler = {
  fetchCourses(): Promise<Course[]> {
    return ipcRenderer.invoke("fetch-courses");
  },
  fetchCourse(courseId: number): Promise<Course> {
    return ipcRenderer.invoke("fetch-course", courseId);
  },
  addCourse(courseName: string): Promise<Course> {
    return ipcRenderer.invoke("add-course", courseName);
  },
  editCourse(course: Pick<Course, "id" | "name">): Promise<Unit> {
    return ipcRenderer.invoke("edit-course", course);
  },
  deleteCourse(courseId: number | string): Promise<unknown> {
    return ipcRenderer.invoke("delete-course", courseId);
  },
  fetchUnits(): Promise<Unit[]> {
    return ipcRenderer.invoke("fetch-units");
  },
  fetchUnit(unitId: number): Promise<Unit> {
    return ipcRenderer.invoke("fetch-unit", unitId);
  },
  addUnit(courseId: number, unitName: string): Promise<Unit> {
    return ipcRenderer.invoke("add-unit", courseId, unitName);
  },
  editUnit(unit: Unit): Promise<Unit> {
    return ipcRenderer.invoke("edit-unit", unit);
  },
  deleteUnit(unitId: number | string): Promise<unknown> {
    return ipcRenderer.invoke("delete-unit", unitId);
  },
  addLesson(unitId: number, LessonName: string): Promise<Lesson> {
    return ipcRenderer.invoke("add-lesson", unitId, LessonName);
  },
  fetchLesson(lessonId: number): Promise<Lesson> {
    return ipcRenderer.invoke("fetch-lesson", lessonId);
  },
  editLesson(lesson: Lesson): Promise<Lesson> {
    return ipcRenderer.invoke("edit-lesson", lesson);
  },
  deleteLesson(lessonId: number | string): Promise<unknown> {
    return ipcRenderer.invoke("delete-lesson", lessonId);
  },
  addQuestion(lessonId: number, questionText: string): Promise<Question> {
    return ipcRenderer.invoke("add-question", lessonId, questionText);
  },
  fetchQuestion(questionId: number): Promise<Question> {
    return ipcRenderer.invoke("fetch-question", questionId);
  },
  editQuestion(question: Question): Promise<Question> {
    return ipcRenderer.invoke("edit-question", question);
  },
  deleteQuestion(questionId: number | string): Promise<unknown> {
    return ipcRenderer.invoke("delete-question", questionId);
  },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;
