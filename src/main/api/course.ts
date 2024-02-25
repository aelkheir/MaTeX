import { ipcMain } from "electron";
import { Course } from "../entities/Course";

const fetchUnits = () => {
  const repository = Course.getRepository();
  return repository
    .createQueryBuilder("course")
    .orderBy("course.id", "ASC")
    .getMany();
};

const fetchCourse = (_: Electron.IpcMainInvokeEvent, courseId: number) => {
  const repository = Course.getRepository();
  return repository
    .createQueryBuilder("course")
    .where("course.id = :courseId", { courseId })
    .leftJoinAndSelect("course.units", "units")
    .getOneOrFail();
};

const addCourse = async (_: Electron.IpcMainInvokeEvent, name: string) => {
  const repository = Course.getRepository();
  const course = repository.save(repository.create({ name }));
  return course;
};

const editCourse = async (_: Electron.IpcMainInvokeEvent, edited: Course) => {
  const repository = Course.getRepository();
  const course = await Course.findOneOrFail({
    where: { id: edited.id },
  });
  course.name = edited.name;
  const updatedCourse = await repository.save(course);
  return updatedCourse;
};

const deleteCourse = async (
  _: Electron.IpcMainInvokeEvent,
  courseId: number
) => {
  return await Course.delete(courseId);
};

export const setUpCourseAPI = () => {
  ipcMain.handle("fetch-courses", fetchUnits);
  ipcMain.handle("fetch-course", fetchCourse);
  ipcMain.handle("add-course", addCourse);
  ipcMain.handle("edit-course", editCourse);
  ipcMain.handle("delete-course", deleteCourse);
};
