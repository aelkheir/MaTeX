import React, { useEffect, useRef } from "react";
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  To,
  redirect,
  useLoaderData,
  useParams,
  useSubmit,
} from "react-router-dom";
import { LabelLarge } from "../components/text/LabelLarge";
import { Course, Unit } from "../../main/entities";
import { EditorContent, generateText, useEditor } from "@tiptap/react";
import { InlineLatex } from "../components/tiptap/LatexNode";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import {
  Button,
  Dialog,
  DialogTrigger,
  FieldError,
  Heading,
  Input,
  Label,
  Modal,
  ModalOverlay,
  TextField,
  Text as RACText,
} from "react-aria-components";
import {
  ClipboardIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Controller, RefCallBack, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export async function loader({ params }: LoaderFunctionArgs) {
  const course = await window.electron.fetchCourse(+params.courseId);
  return { course };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  switch (request.method) {
    case "POST":
      const unit = await window.electron.addUnit(
        Number(params.courseId),
        String(updates.name)
      );
      return redirect(`units/${unit.id}`);
    case "PUT":
      await window.electron.editCourse({
        id: Number(params.courseId),
        name: String(updates.name),
      });
      return null;
    case "DELETE":
      await window.electron.deleteCourse(Number(params.courseId));
      return redirect(String(updates.redirectTo));
  }
  return null;
}

const schema = yup.object({
  name: yup.string().test({
    name: "value",
    skipAbsent: true,
    test(value, ctx) {
      if (value === "") {
        return ctx.createError({ message: "Required" });
      }
      const text = generateText(JSON.parse(value), [
        Document.extend({
          content: "block",
        }),
        Text,
        Paragraph,
        InlineLatex,
      ]);
      if (text === "") {
        return ctx.createError({ message: "Required" });
      }
      if (text.length > 0 && text.length <= 4) {
        return ctx.createError({
          message: "Name must be at least 5 characters long",
        });
      }
      return true;
    },
  }),
});

export const UnitList = () => {
  const { course } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <>
      <div className="col-start-1 row-start-2 bg-ref-primary-40 flex flex-col rounded-br-md">
        <div className="w-full h-6 shrink-0 flex items-center justify-between px-4 mb-1">
          <AddUnit />
          <EditCourse course={course} key={"edit-" + String(course.id)} />
          <DeleteCourse key={"delete-" + String(course.id)} />
        </div>
        <div className="grow overflow-y-auto px-4 scroll-smooth flex flex-col gap-1">
          {course.units.map((unit) => (
            <TipTapNav
              unit={unit}
              key={unit.id}
              json={unit.name}
              to={`units/${unit.id}`}
            />
          ))}
          <div className="sticky h-10 shrink-0 bottom-0 left-0 right-0 bg-gradient-to-t from-ref-primary-40 pointer-events-none"></div>
        </div>
        <button
          className="w-full h-16 shrink-0 flex items-center justify-center px-4"
          onClick={() => {
            document.documentElement.classList.toggle("dark");
          }}
        >
          <LabelLarge color="text-ref-primary-100">Switch Theme</LabelLarge>
        </button>
      </div>
      <Outlet />
    </>
  );
};

const AddUnit = () => {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      name: "",
    },
    resolver: yupResolver(schema),
  });
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogTrigger>
      <Button className="h-full inline-flex items-center text-ref-primary-100 px-2 text-xs font-normal ltr:tracking-[0.1px] cursor-default">
        <PlusIcon className="w-4 h-4 mr-2" />
        Add Unit
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
                  Add Unit
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    if (formRef.current) {
                      submit(formRef.current, { method: "POST" });
                      close();
                    }
                  })}
                  className="mt-2"
                >
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Name is required." }}
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
                        // Let React Hook Form handle validation instead of the browser.
                        validationBehavior="aria"
                        isInvalid={invalid}
                        className={"flex flex-col"}
                      >
                        <Label>Name</Label>
                        <Input ref={ref} hidden />
                        <TipTapInput
                          content={value}
                          onChange={onChange}
                          contentRef={ref}
                        />
                        <RACText slot="description">
                          You can write inline LaTeX using{" "}
                          <span className="italic">
                            ${"<"}latex_code{">"}$
                          </span>
                        </RACText>
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

const DeleteCourse = () => {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      confirmation: "",
    },
  });
  const params = useParams();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  return (
    <DialogTrigger>
      <Button className="h-full inline-flex items-center text-ref-primary-100 px-2 text-xs font-normal ltr:tracking-[0.1px] cursor-default">
        <TrashIcon className="w-4 h-4 mr-2" />
        Delete Course
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
                  Delete course
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    const formData = new FormData();
                    formData.append("courseId", String(params.courseId));
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

const EditCourse = ({ course }: { course: Course }) => {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      name: course.name,
    },
  });
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogTrigger>
      <Button className="h-full inline-flex items-center text-ref-primary-100 px-2 text-xs font-normal ltr:tracking-[0.1px] cursor-default">
        <PencilIcon className="w-4 h-4 mr-2" />
        Edit Course
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
                  Edit course
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    if (formRef.current) {
                      submit(formRef.current, { method: "PUT" });
                      close();
                    }
                  })}
                  className="mt-2"
                >
                  <Controller
                    control={control}
                    name="name"
                    rules={{
                      required: "Name is required",
                      minLength: {
                        value: 5,
                        message: "Minimum length is 5 characters.",
                      },
                    }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <TextField
                        name={name}
                        value={value}
                        defaultValue={course.name}
                        onChange={onChange}
                        onBlur={onBlur}
                        autoFocus
                        isRequired
                        // // Let React Hook Form handle validation instead of the browser.
                        validationBehavior="aria"
                        isInvalid={invalid}
                        className={"flex flex-col"}
                      >
                        <Label>Name</Label>
                        <Input
                          ref={ref}
                          className={
                            "p-2 bg-gray-300 grow outline-none border-b-2 border-transparent focus:border-primary"
                          }
                        />
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

export const TipTapInput = ({
  content,
  onChange,
  contentRef,
}: {
  content: string;
  onChange: (...event: unknown[]) => void;
  contentRef: RefCallBack;
}) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "p-2 bg-gray-300 grow outline-none border-b-2 border-transparent focus:border-primary",
      },
    },
    extensions: [
      Document.extend({
        content: "block",
      }),
      Text,
      Paragraph.configure({
        HTMLAttributes: {
          class: "h-full",
        },
      }),
      InlineLatex,
    ],
    content: !content ? "<p></p>" : JSON.parse(content),
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  useEffect(() => {
    editor?.commands.focus("end");
  }, [editor]);

  return (
    <div className="overflow-y-auto flex flex-col">
      <EditorContent
        editor={editor}
        ref={contentRef}
        className="grow w-full flex items-center overflow-y-auto text-on-surface"
      />
    </div>
  );
};

const TipTapNav: React.FC<{
  json: string;
  to: To;
  unit: Unit;
}> = ({ json, to, unit }) => {
  const editor = useEditor({
    editable: false,
    editorProps: {
      attributes: {
        class: "h-full flex items-center px-3 py-[10px] outline-none",
      },
    },
    extensions: [
      Document.extend({
        content: "block",
      }),
      Text,
      Paragraph.configure({
        HTMLAttributes: {
          class: "h-full text-sm ltr:tracking-[0.25px] font-normal",
        },
      }),
      InlineLatex,
    ],
    content: JSON.parse(json),
  });

  useEffect(() => {
    editor?.commands.setContent(JSON.parse(json));
  }, [json]);

  return (
    <NavLink
      id={`u-${unit.id}`}
      draggable={false}
      to={to}
      className={({ isActive }) =>
        `w-full flex items-center text-ref-neutral-80 focus:outline-none focus-visible:ring-2 ring-inset ring-white ${
          isActive
            ? "bg-ref-primary-40 sticky z-10 top-0 bottom-0 left-0 text-ref-primary-100"
            : " text-ref-neutral-80"
        }`
      }
    >
      {({ isActive }) => (
        <EditorContent
          editor={editor}
          className={`h-full w-full ${isActive ? "bg-white/10" : ""}`}
        />
      )}
    </NavLink>
  );
};
