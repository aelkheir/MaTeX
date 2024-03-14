import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Root } from "./routes/Root";
import Error from "./routes/Error";
import {
  Course,
  loader as courseLoader,
  action as courseAction,
} from "./routes/Course";
import {
  UnitList,
  loader as unitListLoader,
  action as unitListAction,
} from "./routes/UnitList";
import {
  LessonList,
  loader as lessonListLoader,
  action as lessonListAction,
} from "./routes/LessonList";
import {
  QuestionList,
  loader as questionListLoader,
  action as questionListAction,
} from "./routes/QuestionList";
import {
  Question,
  loader as questionLoader,
  action as questionAction,
} from "./routes/Question";
import { NewQuestion, action as newQuestionAction } from "./routes/NewQuestion";
import { Exam, loader as newExamLoader } from "./routes/Exam";
import {
  ExamQuestionList,
  loader as examUnitTabsLoader,
} from "./routes/ExamQuestionList";

const router = createMemoryRouter(
  [
    {
      path: "/",
      element: <Root />,
      errorElement: <Error />,
      children: [
        {
          path: "/exams/courses",
          element: <Exam />,
          errorElement: <Error />,
          loader: newExamLoader,
          children: [
            {
              path: "/exams/courses/:courseId/*",
              element: <ExamQuestionList />,
              errorElement: <Error />,
              loader: examUnitTabsLoader,
            },
          ],
        },
        {
          path: "/courses",
          element: <Course />,
          errorElement: <Error />,
          loader: courseLoader,
          action: courseAction,
          children: [
            {
              index: true,
              element: (
                <div className="col-start-1 row-start-2 bg-ref-primary-40 flex flex-col rounded-br-md"></div>
              ),
            },
            {
              path: "/courses/:courseId",
              element: <UnitList />,
              errorElement: <Error />,
              loader: unitListLoader,
              action: unitListAction,
              children: [
                {
                  path: "units/:unitId",
                  element: <LessonList />,
                  errorElement: <Error />,
                  loader: lessonListLoader,
                  action: lessonListAction,
                  children: [
                    {
                      path: "lessons/:lessonId",
                      element: <QuestionList />,
                      errorElement: <Error />,
                      loader: questionListLoader,
                      action: questionListAction,
                    },
                    {
                      path: "lessons/:lessonId/questions",
                      errorElement: <Error />,
                      children: [
                        {
                          path: ":questionId",
                          element: <Question />,
                          errorElement: <Error />,
                          loader: questionLoader,
                          action: questionAction,
                        },
                        {
                          path: "new",
                          element: <NewQuestion />,
                          errorElement: <Error />,
                          action: newQuestionAction,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  { initialEntries: ["/courses"] }
);

export default function App() {
  return <RouterProvider router={router} />;
}
