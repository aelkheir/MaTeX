import { ipcMain } from "electron";
import { Lesson } from "../entities/Lesson";
import { Question } from "../entities/Question";

const addQuestion = async (
  _: Electron.IpcMainInvokeEvent,
  lessonId: number,
  text: string
): Promise<Question> => {
  const lesson = await Lesson.findOneOrFail({ where: { id: lessonId } });
  const repository = Question.getRepository();
  const question = await repository.save(repository.create({ text, lesson }));
  return question;
};

const fetchQuestion = async (
  _: Electron.IpcMainInvokeEvent,
  questionId: number
): Promise<Question> => {
  const repository = Question.getRepository();
  return await repository
    .createQueryBuilder("question")
    .where("question.id = :questionId", { questionId })
    .getOneOrFail();
};

const fetchCourseQuestion = async (
  _: Electron.IpcMainInvokeEvent,
  courseId: number
): Promise<Question[]> => {
  const repository = Question.getRepository();
  return await repository
    .createQueryBuilder("question")
    .leftJoinAndSelect("question.unit", "q_unit")
    .leftJoinAndSelect("question.lesson", "lesson")
    .leftJoinAndSelect("lesson.unit", "l_unit")
    .leftJoinAndSelect("q_unit.course", "q_course")
    .leftJoinAndSelect("l_unit.course", "l_course")
    .where("q_course.id = :courseId", { courseId })
    .orWhere("l_course.id = :courseId", { courseId })
    .getMany();
};

const fetchGeneralUnitQuestions = async (
  _: Electron.IpcMainInvokeEvent,
  unitId: number
): Promise<Question[]> => {
  const repository = Question.getRepository();
  return await repository
    .createQueryBuilder("question")
    .leftJoinAndSelect("question.unit", "unit")
    .where("unit.id = :unitId", { unitId })
    .getMany();
};

const fetchLessonQuestions = async (
  _: Electron.IpcMainInvokeEvent,
  lessonId: number
) => {
  return Question.find({
    where: { lesson: { id: lessonId } },
    order: { id: "ASC" },
  });
};

const editQuestion = async (
  _: Electron.IpcMainInvokeEvent,
  edited: Question
): Promise<Question> => {
  const repository = Question.getRepository();
  const question = await Question.findOneOrFail({
    where: { id: edited.id },
  });
  question.text = edited.text;
  return await repository.save(question);
};

const deleteQuestion = async (
  _: Electron.IpcMainInvokeEvent,
  questionId: number
) => {
  return await Question.delete(questionId);
};

export const setUpQuestionAPI = () => {
  ipcMain.handle("add-question", addQuestion);
  ipcMain.handle("fetch-question", fetchQuestion);
  ipcMain.handle("fetch-course-questions", fetchCourseQuestion);
  ipcMain.handle("edit-question", editQuestion);
  ipcMain.handle("delete-question", deleteQuestion);
  ipcMain.handle("fetch-lesson-questions", fetchLessonQuestions);
  ipcMain.handle("fetch-general-unit-questions", fetchGeneralUnitQuestions);
};
