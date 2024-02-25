import { setUpCourseAPI } from "./course";
import { setUpLessonAPI } from "./lesson";
import { setUpQuestionAPI } from "./questions";
import { setUpUnitAPI } from "./unit";

export function setupAPI() {
  setUpCourseAPI();
  setUpUnitAPI();
  setUpLessonAPI();
  setUpQuestionAPI();
}
