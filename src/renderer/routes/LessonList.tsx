import React, { useEffect, useRef } from "react";
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "react-router-dom";
import { useEditor, EditorContent, generateText } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import {
  Unit as UnitModel,
  Lesson as LessonModel,
  Unit,
} from "../../main/entities";
import { InlineLatex } from "../components/tiptap/LatexNode";
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
  Popover,
  TextField,
  Text as RACText,
  ListBoxItem,
  ListBox,
} from "react-aria-components";
import {
  ClipboardIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { Controller, RefCallBack, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export async function loader({ params }: LoaderFunctionArgs) {
  const unit = await window.electron.fetchUnit(Number(params.unitId));
  return { unit };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  switch (request.method) {
    case "POST":
      const lesson = await window.electron.addLesson(
        Number(params.unitId),
        String(updates.name)
      );
      return redirect(
        `/courses/${params.courseId}/units/${params.unitId}/lessons/${lesson.id}`
      );

    case "DELETE":
      await window.electron.deleteUnit(Number(updates.unitId));
      return redirect(`/courses/${params.courseId}`);

    case "PUT":
      await window.electron.editUnit({
        id: Number(params.unitId),
        name: String(updates.name),
      });
      return redirect(`/courses/${params.courseId}/units/${params.unitId}`);
  }
  return null;
}

export const LessonList = () => {
  const { unit } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();

  return (
    <>
      <div className="col-start-2 row-start-1 row-span-2 flex w-full">
        <div className="relative w-full bg-surface">
          <div className="w-full h-full bg-primary/5  rounded-r-md flex flex-col">
            <div className="w-full shrink-0 h-16 flex items-center px-4 justify-between space-x-2">
              <TipTapHeader unit={unit} key={unit.id} />
              <ActionPopover unit={unit} />
            </div>

            <div className="w-full h-6 shrink-0 flex items-center justify-between px-4 mb-1">
              <AddLesson key={unit.lessons.length + 1} />
            </div>
            <ListBox
              aria-label="Lessons list"
              selectionMode="single"
              disallowEmptySelection={true}
              items={unit.lessons}
              onSelectionChange={(keys) => {
                const currentKey = Array.from(keys)[0];
                currentKey && navigate(`lessons/${currentKey}`);
              }}
              className={
                "px-4 grow overflow-y-auto scroll-smooth flex flex-col gap-1"
              }
            >
              {(lesson) => <TipTapNav lesson={lesson} key={lesson.id} />}
            </ListBox>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

const TipTapHeader: React.FC<{ unit: UnitModel }> = ({ unit }) => {
  const editor = useEditor(
    {
      editable: false,
      editorProps: {
        attributes: {
          class: "h-full flex items-center outline-none overflow-hidden",
        },
      },
      extensions: [
        Document.extend({
          content: "block",
        }),
        Text,
        Paragraph.configure({
          HTMLAttributes: {
            class: "line-clamp-1",
          },
        }),
        InlineLatex,
      ],
      content: JSON.parse(unit.name),
    },
    [unit.id, unit.name]
  );

  return <EditorContent editor={editor} className="h-full text-on-surface" />;
};

const ActionPopover = ({ unit }: { unit: Unit }) => {
  return (
    <DialogTrigger>
      <Button
        aria-label="Ellipsis Actions"
        className={`aspect-square p-1 flex items-center justify-center`}
      >
        <EllipsisHorizontalIcon className="h-6 w-6 text-gray-700" />
      </Button>
      <Popover
        placement="bottom right"
        className={`
        group w-40 ring-1 ring-black/10 bg-white`}
      >
        <Dialog
          className="outline-none text-gray-700 w-full flex flex-col gap-1"
          aria-label="Actions on unit"
        >
          {({ close }) => (
            <>
              <EditUnit unit={unit} closePopover={close} />
              <DeleteUnit unit={unit} closePopover={close} />
            </>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

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

const EditUnit = ({
  unit,
  closePopover,
}: {
  unit: Unit;
  closePopover: () => void;
}) => {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      name: unit.name,
    },
    resolver: yupResolver(schema),
  });
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogTrigger>
      <Button
        aria-label="Edit unit"
        className={`flex items-center text-sm py-1 px-2 pressed:bg-black/5 focus-visible:bg-black/5`}
      >
        Edit Unit
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
                  Edit Unit
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    if (formRef.current) {
                      submit(formRef.current, { method: "PUT" });
                      close();
                      closePopover();
                    }
                  })}
                  className="mt-2"
                >
                  <Controller
                    control={control}
                    name="name"
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <TextField
                        name={name}
                        value={value}
                        defaultValue={unit.name}
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
                        <TipTapInput
                          content={value}
                          onChange={onChange}
                          contentRef={ref}
                          onSubmit={handleSubmit(() => {
                            if (formRef.current) {
                              submit(formRef.current, { method: "PUT" });
                              close();
                              closePopover();
                            }
                          })}
                        />
                        <Input ref={ref} hidden />
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

export const TipTapInput = ({
  content,
  onChange,
  contentRef,
  onSubmit,
}: {
  content: string;
  onChange: (...event: unknown[]) => void;
  contentRef: RefCallBack;
  onSubmit: () => void;
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
        className="grow w-full flex items-center overflow-y-auto text-on-surface"
      />
    </div>
  );
};

const DeleteUnit = ({
  unit,
  closePopover,
}: {
  unit: Unit;
  closePopover: () => void;
}) => {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      confirmation: "",
    },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  return (
    <DialogTrigger>
      <Button
        aria-label="Delete unit"
        className={`flex items-center  text-sm py-1 px-2 pressed:bg-black/5 focus-visible:bg-black/5`}
      >
        Delete Unit
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
                  Delete Unit
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    const formData = new FormData();
                    formData.append("unitId", String(unit.id));
                    if (formRef.current) {
                      submit(formData, { method: "DELETE" });
                      closePopover();
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

const AddLesson = () => {
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
      <Button className="h-full inline-flex items-center text-on-surface px-2 text-xs font-normal ltr:tracking-[0.1px] cursor-default">
        <PlusIcon className="w-4 h-4 mr-2 text-inherit" />
        Add Lesson
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
                  Add Lesson
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
                          onSubmit={handleSubmit(() => {
                            if (formRef.current) {
                              submit(formRef.current, { method: "POST" });
                              close();
                            }
                          })}
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

const TipTapNav = ({ lesson }: { lesson: LessonModel }) => {
  const editor = useEditor(
    {
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
      content: JSON.parse(lesson.name),
    },
    [lesson.name]
  );

  return (
    <ListBoxItem
      id={lesson.id}
      textValue={editor ? editor.getText() : lesson.name}
      className={`w-full flex items-center text-outline focus:outline-none focus-visible:ring-2 ring-inset ring-outline selected:bg-black/5 selected:sticky selected:z-10 selected:top-0 selected:bottom-0 left-0 selected:text-on-surface`}
    >
      <EditorContent editor={editor} className={`h-full w-full`} />
    </ListBoxItem>
  );
};
