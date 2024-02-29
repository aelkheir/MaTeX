import { setUpCourseAPI } from "./course";
import { setUpLessonAPI } from "./lesson";
import { setUpLevelAPI } from "./level";
import { setUpQuestionAPI } from "./questions";
import { setUpUnitAPI } from "./unit";

export function setupAPI() {
  setUpLevelAPI();
  setUpCourseAPI();
  setUpUnitAPI();
  setUpLessonAPI();
  setUpQuestionAPI();
}
