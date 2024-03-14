import { Course } from "../main/entities";

export function groupCoursesByLevel(
  courses: Course[],
  cb: (course: Course) => string
) {
  const result: { name: string; courses: Course[] }[] = [];
  for (const course of courses) {
    const key = cb(course);
    let group = result.find((group) => group.name === key);
    if (!group) {
      group = { name: key, courses: [] };
      result.push(group);
    }
    group.courses.push(course);
  }
  return result;
}
