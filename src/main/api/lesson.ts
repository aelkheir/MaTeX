import { ipcMain } from "electron";
import { Lesson } from "../entities/Lesson";
import { Unit } from "../entities/Unit";

const fetchLesson = async (
  _: Electron.IpcMainInvokeEvent,
  lessonId: number
): Promise<Lesson> => {
  const repository = Lesson.getRepository();
  return repository
    .createQueryBuilder("lesson")
    .where("lesson.id = :lessonId", { lessonId })
    .leftJoinAndSelect("lesson.questions", "questions")
    .orderBy("questions.id", "ASC")
    .getOneOrFail();
};

const fetchUnitLessons = async (
  _: Electron.IpcMainInvokeEvent,
  unitId: number
) => {
  const repository = Lesson.getRepository();
  return repository
    .createQueryBuilder("lesson")
    .innerJoin("lesson.unit", "unit")
    .where("unit.id = :unitId", { unitId })
    .orderBy("lesson.id", "ASC")
    .loadRelationCountAndMap("lesson.questionCount", "lesson.questions")
    .getMany();
};

const addLesson = async (
  _: Electron.IpcMainInvokeEvent,
  unitId: number,
  name: string
) => {
  const unit = await Unit.findOneOrFail({ where: { id: unitId } });
  const repository = Lesson.getRepository();
  const lesson = await repository.save(repository.create({ name, unit }));
  return lesson;
};

const editLesson = async (_: Electron.IpcMainInvokeEvent, edited: Lesson) => {
  const repository = Lesson.getRepository();
  const lesson = await Lesson.findOneOrFail({
    where: { id: edited.id },
  });
  lesson.name = edited.name;
  return await repository.save(lesson);
};

const deleteLesson = async (
  _: Electron.IpcMainInvokeEvent,
  lessonId: number
) => {
  return await Lesson.delete(lessonId);
};

export const setUpLessonAPI = () => {
  ipcMain.handle("fetch-lesson", fetchLesson);
  ipcMain.handle("edit-lesson", editLesson);
  ipcMain.handle("delete-lesson", deleteLesson);
  ipcMain.handle("fetch-unit-lessons", fetchUnitLessons);
  ipcMain.handle("add-lesson", addLesson);
};
