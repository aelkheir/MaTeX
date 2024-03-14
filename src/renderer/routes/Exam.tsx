import {
  Button,
  Collection,
  Header,
  Key,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Section,
  Select,
  SelectValue,
} from "react-aria-components";
import { groupCoursesByLevel } from "../helpers";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { Course } from "../../main/entities";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";

export async function loader() {
  const courses = await window.electron.fetchCourses();
  const courseGroups = groupCoursesByLevel(courses, (course) =>
    course.level ? course.level.name : ""
  );

  return { courseGroups };
}

export const Exam = () => {
  const { courseGroups } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const navigate = useNavigate();
  const params = useParams();

  return (
    <>
      <div className="col-start-1 col-span-2 row-start-1 row-span-1 flex flex-col">
        <div className="p-4 w-80 self-start">
          <CourseSelect
            courseGroups={courseGroups}
            selectedKey={params.courseId || -1}
            onSelectionChange={(key) => navigate(`${key}`)}
          />
        </div>
      </div>
      <Outlet />
    </>
  );
};

const CourseSelect = ({
  courseGroups,
  selectedKey,
  onSelectionChange,
}: {
  courseGroups: {
    name: string;
    courses: Course[];
  }[];
  selectedKey: Key;
  onSelectionChange: (key: Key) => void;
}) => {
  return (
    <Select
      className="flex flex-col gap-1"
      placeholder="Select a course"
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
    >
      <Label className="text-on-background cursor-default text-xs">
        Course
      </Label>
      <Button className="h-8 flex items-center cursor-default border-0 bg-black bg-opacity-5 pressed:bg-opacity-10 py-1 p-2 text-xs text-left text-gray-700">
        <SelectValue className="grow truncate w-10 placeholder-shown:italic">
          {({ selectedText, selectedItem, isPlaceholder }) =>
            !isPlaceholder
              ? // @ts-ignore
                selectedItem.level
                ? // @ts-ignore
                  `${selectedText} [${selectedItem.level.name}]`
                : selectedText
              : "Select a course or create one"
          }
        </SelectValue>
        <ChevronUpDownIcon className="h-6 w-6 text-gray-700" />
      </Button>
      <Popover className="max-h-60 w-[--trigger-width] overflow-auto bg-white text-base ring-1 ring-black/5">
        <ListBox className="outline-none p-1" items={courseGroups}>
          {(section) => (
            <Section id={section.name}>
              <Header
                className={
                  "h-4 text-xs font-medium flex items-center cursor-default select-none py-1 pl-2 outline-none text-on-surface italic"
                }
              >
                {section.name}
              </Header>
              <Collection items={section.courses}>
                {(item) => (
                  <ListBoxItem
                    id={String(item.id)}
                    textValue={item.name}
                    className={
                      "h-8 text-sm group flex items-center gap-2 cursor-default select-none py-1 px-4 outline-none text-gray-900 focus:bg-black/5 focus:text-black"
                    }
                  >
                    <span className="flex-1 flex items-center gap-2 truncate font-normal group-selected:font-medium">
                      {item.name}
                    </span>
                  </ListBoxItem>
                )}
              </Collection>
            </Section>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
};
