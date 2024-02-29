import { ipcMain } from "electron";
import { Course } from "../entities/Course";
import { Level } from "../entities";

const fetchCourses = () => {
  const repository = Course.getRepository();
  return repository
    .createQueryBuilder("course")
    .leftJoinAndSelect("course.level", "level")
    .orderBy("level.name", "ASC")
    .addOrderBy("course.name", "ASC")
    .getMany();
};

const fetchCourse = (_: Electron.IpcMainInvokeEvent, courseId: number) => {
  const repository = Course.getRepository();
  return repository
    .createQueryBuilder("course")
    .where("course.id = :courseId", { courseId })
    .leftJoinAndSelect("course.level", "level")
    .leftJoinAndSelect("course.units", "units")
    .getOneOrFail();
};

const addCourse = async (
  _: Electron.IpcMainInvokeEvent,
  { name, levelName }: { name: string; levelName: string }
) => {
  const levelRepo = Level.getRepository();
  let level = await levelRepo.findOne({ where: { name: levelName } });
  if (!level && levelName.trim()) {
    level = await levelRepo.save(levelRepo.create({ name: levelName }));
  }

  const repository = Course.getRepository();
  const course = await repository.save(repository.create({ name, level }));
  return course;
};

const editCourse = async (
  _: Electron.IpcMainInvokeEvent,
  edited: Course & { levelName: string }
) => {
  const levelRepo = Level.getRepository();
  let level = await levelRepo.findOne({ where: { name: edited.levelName } });
  if (!level && edited.levelName.trim()) {
    level = await levelRepo.save(levelRepo.create({ name: edited.levelName }));
  }
  const repository = Course.getRepository();
  const course = await Course.findOneOrFail({
    where: { id: edited.id },
  });
  course.name = edited.name;
  course.level = level;
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
  ipcMain.handle("fetch-courses", fetchCourses);
  ipcMain.handle("fetch-course", fetchCourse);
  ipcMain.handle("add-course", addCourse);
  ipcMain.handle("edit-course", editCourse);
  ipcMain.handle("delete-course", deleteCourse);
};
