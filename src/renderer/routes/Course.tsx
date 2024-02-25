import {
  ActionFunctionArgs,
  Form,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import { LabelLarge } from "../components/text/LabelLarge";
import {
  Button,
  Dialog,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  TextField,
} from "react-aria-components";
import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Course as CourseModel } from "../../main/entities";
import { useRef, useState } from "react";

export async function loader() {
  const courseOptions = await window.electron.fetchCourses();
  return { courseOptions };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  if (!updates.name) return null;
  const course = await window.electron.addCourse(String(updates.name));
  return redirect(`/courses/${course.id}`);
}

export const Course = () => {
  const { courseOptions } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const [isOpen, setOpen] = useState(false);
  const triggerRef = useRef(null);
  return (
    <>
      <div className="col-start-1 row-start-1 bg-ref-primary-40 flex flex-col rounded-tr-md">
        <div className="w-full h-16 shrink-0 flex items-center pl-4">
          <LabelLarge color="text-ref-primary-100">Recent</LabelLarge>
        </div>
        <div className="w-full h-16 shrink-0 flex items-end px-4 gap-1 mb-1">
          <CourseSelect courseOptions={courseOptions} />
          <AddCourse
            triggerRef={triggerRef}
            isOpen={isOpen}
            setOpen={setOpen}
          />
        </div>
      </div>
      <Outlet />
    </>
  );
};

const AddCourse = ({
  triggerRef,
  isOpen,
  setOpen,
}: {
  triggerRef: React.MutableRefObject<HTMLButtonElement>;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div>
      <Button
        ref={triggerRef}
        aria-label="Add Course"
        className={`aspect-square h-10 bg-white opacity-90 flex items-center justify-center`}
        onPress={() => setOpen(true)}
      >
        <PlusIcon className="h-6 w-6 text-gray-700" />
      </Button>
      <Popover
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setOpen}
        className={`
        w-72 group ring-1 ring-black/10 bg-white`}
      >
        <Dialog
          className="p-2 outline-none text-gray-700 w-full"
          aria-label="Create Course"
        >
          <Form
            method="PUT"
            className="flex flex-col"
            onSubmit={() => setOpen(false)}
          >
            <TextField
              name="name"
              type="text"
              autoFocus
              isRequired
              minLength={5}
              className={"flex flex-col"}
            >
              <Label>Course name</Label>
              <Input />
              <FieldError />
            </TextField>
            <Button type="submit">Create</Button>
          </Form>
        </Dialog>
      </Popover>
    </div>
  );
};

const CourseSelect = ({ courseOptions }: { courseOptions: CourseModel[] }) => {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Select
      className="flex flex-col gap-1 w-full"
      placeholder="Select a course or create one"
      selectedKey={params.courseId || -1}
      onSelectionChange={(key) => {
        navigate(`/courses/${key}`);
      }}
    >
      <Label className="text-white cursor-default text-xs">Course</Label>
      <Button className="flex items-center cursor-default border-0 bg-white bg-opacity-90 pressed:bg-opacity-100 py-2 pl-5 pr-2 text-base text-left leading-normal text-gray-700 focus:outline-none focus-visible:ring-2 ring-white ring-offset-2 ring-offset-rose-700">
        <SelectValue className="flex-1 truncate placeholder-shown:italic" />
        <ChevronUpDownIcon className="h-6 w-6 text-gray-700" />
      </Button>
      <Popover className="max-h-60 w-[--trigger-width] overflow-auto bg-white text-base ring-1 ring-black/5">
        <ListBox className="outline-none p-1" items={courseOptions}>
          {(item) => (
            <ListBoxItem
              id={String(item.id)}
              textValue={item.name}
              className={
                "group flex items-center gap-2 cursor-default select-none py-2 px-4 outline-none text-gray-900 focus:bg-rose-600 focus:text-white"
              }
            >
              <span className="flex-1 flex items-center gap-2 truncate font-normal group-selected:font-medium">
                {item.name}
              </span>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
};
