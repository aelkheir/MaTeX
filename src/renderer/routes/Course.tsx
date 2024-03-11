import {
  ActionFunctionArgs,
  Form,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
  useSubmit,
} from "react-router-dom";
import { LabelLarge } from "../components/text/LabelLarge";
import {
  Button,
  Collection,
  ComboBox,
  Dialog,
  DialogTrigger,
  FieldError,
  Group,
  Header,
  Heading,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
  Popover,
  Section,
  Select,
  SelectValue,
  TextField,
  Text as RACText,
} from "react-aria-components";
import {
  AdjustmentsHorizontalIcon,
  ChevronUpDownIcon,
  ClipboardIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Course as CourseModel, Level } from "../../main/entities";
import { Controller, useForm } from "react-hook-form";
import { useRef } from "react";

function groupBy(courses: CourseModel[], cb: (course: CourseModel) => string) {
  const result: { name: string; courses: CourseModel[] }[] = [];
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

export async function loader() {
  const courses = await window.electron.fetchCourses();
  const courseGroups = groupBy(courses, (course) =>
    course.level ? course.level.name : ""
  );
  const levels = await window.electron.fetchLevels();

  return { courseGroups, levels };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  switch (request.method) {
    case "POST":
      if (!updates.name) return null;
      const course = await window.electron.addCourse({
        name: String(updates.name),
        levelName: String(updates.levelName).trim(),
      });
      return redirect(`/courses/${course.id}`);
    case "PUT":
      await window.electron.editLevel({
        id: Number(updates.levelId),
        name: String(updates.name),
      });
      return null;
    case "DELETE":
      await window.electron.deleteLevel(Number(updates.levelId));
      return null;
  }
  return null;
}

export const Course = () => {
  const { courseGroups, levels } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  return (
    <>
      <div className="col-start-1 row-start-1 bg-ref-primary-40 flex flex-col rounded-tr-md">
        <div className="px-2 py-2 ">
          <NavLink
            className="px-2 cursor-default shrink-0 flex items-center text-ref-primary-100 text-sm"
            to={"/exams/new"}
          >
            Create Exam
          </NavLink>
        </div>
        <div className="w-full shrink-0 flex items-center pl-4">
          <LabelLarge color="text-ref-primary-100">Recent</LabelLarge>
        </div>
        <div className="w-full flex items-end px-4 gap-1 mb-1">
          <div className="grow flex">
            <CourseSelect courseGroups={courseGroups} />
          </div>
          <div className="flex flex-col">
            <div className="self-end">
              <LevelsPopover levels={levels} />
            </div>
            <AddCourse levels={levels} />
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

const LevelsPopover = ({ levels }: { levels: Level[] }) => {
  return (
    <DialogTrigger>
      <Button className="inline-flex items-end justify-center translate-y-0.5">
        <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
      </Button>
      <Popover
        placement="bottom right"
        className={`
        group w-40 ring-1 ring-black/10 bg-white`}
      >
        <Dialog
          className="outline-none text-gray-700 w-full flex flex-col gap-1"
          aria-label="Level"
        >
          {() => {
            return levels.length ? (
              levels.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center px-2 py-1 gap-1"
                >
                  <span className="grow text-xs">{level.name}</span>
                  <EditLevel level={level} />
                  <DeleteLevel level={level} />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-1">
                <span className="text-xs">No levels found</span>
              </div>
            );
          }}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

const AddCourse = ({ levels }: { levels: Level[] }) => {
  return (
    <DialogTrigger>
      <Button
        aria-label="Add Course"
        className={`h-8 aspect-square bg-white opacity-90 flex items-center justify-center`}
      >
        <PlusIcon className="h-6 w-6 text-gray-700" />
      </Button>
      <Popover className={`w-72 group ring-1 ring-black/10 bg-white`}>
        <Dialog
          className="p-2 outline-none text-gray-700 w-full"
          aria-label="Create Course"
        >
          {({ close }) => (
            <Form
              method="POST"
              className="flex flex-col gap-2"
              onSubmit={close}
            >
              <TextField
                name="name"
                type="text"
                autoFocus
                isRequired
                minLength={5}
                className={"flex flex-col gap-1"}
              >
                <Label className="text-xs">Course name</Label>
                <Input
                  className={
                    "px-2 py-1 bg-gray-300 grow outline-none border-b-2 border-transparent focus:border-primary text-sm"
                  }
                />
                <FieldError />
              </TextField>
              <ComboBox
                name="levelName"
                formValue="text"
                allowsCustomValue
                className={"flex flex-col gap-1"}
              >
                <Label className="text-xs">Course level</Label>
                <Group className="flex items-center py-1 px-2 bg-gray-300 grow outline-none border-b-2 border-transparent focus-within:border-primary bg-black/10">
                  <Input
                    placeholder="no level selected"
                    className={
                      "grow border-none bg-transparent outline-none text-sm placeholder:italic placeholder:text-outline"
                    }
                  />
                  <Button>
                    <ChevronUpDownIcon className="h-6 w-6 text-gray-700" />
                  </Button>
                </Group>
                <Popover className={"w-72 group ring-1 ring-black/10 bg-white"}>
                  <ListBox items={levels}>
                    {(item) => (
                      <ListBoxItem
                        id={String(item.id)}
                        textValue={item.name}
                        className={
                          "h-8 group flex items-center gap-2 cursor-default select-none py-1 px-2 outline-none text-gray-900 focus:bg-black/5 focus:text-black"
                        }
                      >
                        <span className="flex-1 flex items-center truncate font-normal group-selected:font-medium text-xs">
                          {item.name}
                        </span>
                      </ListBoxItem>
                    )}
                  </ListBox>
                </Popover>
                <FieldError />
              </ComboBox>
              <Button type="submit">Create</Button>
            </Form>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

const CourseSelect = ({
  courseGroups,
}: {
  courseGroups: {
    name: string;
    courses: CourseModel[];
  }[];
}) => {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Select
      className="grow flex flex-col gap-1"
      placeholder="Select a course or create one"
      selectedKey={params.courseId || -1}
      onSelectionChange={(key) => {
        navigate(`/courses/${key}`);
      }}
    >
      <Label className="text-white cursor-default text-xs">Course</Label>
      <Button className="h-8 flex items-center cursor-default border-0 bg-white bg-opacity-90 pressed:bg-opacity-100 py-1 p-2 text-xs text-left text-gray-700">
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

const DeleteLevel = ({ level }: { level: Level }) => {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      confirmation: "",
    },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  return (
    <DialogTrigger>
      <Button className="h-6 w-6 p-1 aspect-square inline-flex items-center justify-center cursor-default pressed:ring-2 ring-black/50">
        <TrashIcon className="w-4 h-4 text-outline" />
      </Button>
      <ModalOverlay
        className={`
          fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4`}
      >
        <Modal
          className={`w-full max-w-md overflow-hidden bg-white p-6 text-left align-middle`}
        >
          <Dialog role="dialog" className="outline-none relative">
            {({ close }) => (
              <>
                <Heading
                  slot="title"
                  className="text-xxl font-semibold leading-6 my-0 text-slate-700"
                >
                  Delete Level
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    const formData = new FormData();
                    formData.append("levelId", String(level.id));
                    if (formRef.current) {
                      submit(formData, { method: "DELETE" });
                    }
                  })}
                  className="mt-2"
                >
                  <Controller
                    control={control}
                    name="confirmation"
                    rules={{
                      required: "Cannot be empty",
                      pattern: {
                        value: /^I am absolutely sure\.$/,
                        message: "Text does not match",
                      },
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <TextField
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        isRequired
                        autoFocus
                        // Let React Hook Form handle validation instead of the browser.
                        validationBehavior="aria"
                        isInvalid={invalid}
                        className={"flex flex-col"}
                      >
                        <Label>Confirmation</Label>
                        <Input
                          ref={ref}
                          className={
                            "p-2 bg-gray-300 grow outline-none border-b-2 border-transparent focus:border-primary"
                          }
                        />
                        <div className="flex justify-between">
                          <RACText slot="description">
                            To confirm type:{" "}
                            <span className="italic font-medium">
                              I am absolutely sure.
                            </span>
                          </RACText>
                          <Button
                            aria-label="Copy to clipboard"
                            type="button"
                            className="p-1"
                            onPress={() => {
                              const type = "text/plain";
                              const blob = new Blob(["I am absolutely sure."], {
                                type,
                              });
                              const data = [
                                new ClipboardItem({ [type]: blob }),
                              ];
                              navigator.clipboard.write(data);
                            }}
                          >
                            <ClipboardIcon className="w-4 h-4 text-outline cursor-pointer" />
                          </Button>
                        </div>
                        <FieldError>{error?.message}</FieldError>
                      </TextField>
                    )}
                  />
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      onPress={close}
                      className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-slate-200 text-slate-800 hover:border-slate-300 pressed:bg-slate-300`}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-red-500 text-white hover:border-red-600 pressed:bg-red-600`}
                    >
                      Delete
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};

const EditLevel = ({ level }: { level: Level }) => {
  const { handleSubmit } = useForm({
    defaultValues: {
      name: level.name,
    },
  });
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogTrigger>
      <Button className="h-6 w-6 p-1 aspect-square inline-flex items-center justify-center cursor-default pressed:ring-2 ring-black/50">
        <PencilIcon className="w-4 h-4 text-outline" />
      </Button>
      <ModalOverlay
        className={`
          fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4`}
      >
        <Modal
          className={` w-full max-w-md overflow-hidden bg-white p-6 text-left align-middle`}
        >
          <Dialog role="dialog" className="outline-none relative">
            {({ close }) => (
              <>
                <Heading
                  slot="title"
                  className="text-xxl font-semibold leading-6 my-0 text-slate-700"
                >
                  Edit Level
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    if (formRef.current) {
                      const formData = new FormData(formRef.current);
                      formData.append("levelId", String(level.id));
                      submit(formData, { method: "PUT" });
                      close();
                    }
                  })}
                  className="mt-2"
                >
                  <TextField
                    name={"name"}
                    defaultValue={level.name}
                    autoFocus
                    isRequired
                    className={"flex flex-col"}
                  >
                    <Label>Name</Label>
                    <Input
                      className={
                        "p-2 bg-gray-300 grow outline-none border-b-2 border-transparent focus:border-primary"
                      }
                    />
                    <FieldError />
                  </TextField>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      onPress={close}
                      className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-slate-200 text-slate-800 hover:border-slate-300 pressed:bg-slate-300`}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-red-500 text-white hover:border-red-600 pressed:bg-red-600`}
                    >
                      Add
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
