import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionFunctionArgs,
  Form,
  Link,
  LoaderFunctionArgs,
  NavLink,
  redirect,
  useLoaderData,
  useLocation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useEditor, EditorContent, generateText } from "@tiptap/react";
import { ClipboardIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import { History } from "@tiptap/extension-history";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Lesson, Question } from "../../main/entities";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { useElementScrollRestoration } from "../hooks/useElementScrollRestoration";
import { LabelLarge } from "../components/text/LabelLarge";
import { DisplayLatex, InlineLatex } from "../components/tiptap/LatexNode";
import { Controller, RefCallBack, useForm } from "react-hook-form";
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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  switch (request.method) {
    case "POST":
      await window.electron.editLesson({
        id: Number(params.lessonId),
        name: String(updates.name),
      } as Lesson);
      break;

    case "DELETE":
      await window.electron.deleteLesson(Number(updates.lessonId));
      return redirect(`/courses/${params.courseId}/units/${params.unitId}`);
      break;
    case "PUT":
      const question = await window.electron.addQuestion(
        Number(params.lessonId),
        String(updates.editorContent)
      );
      return redirect(
        `/units/${params.unitId}/lessons/${params.lessonId}/#q-${question.id}`
      );
  }
  return null;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const lesson = await window.electron.fetchLesson(Number(params.lessonId));
  return { lesson };
}

const LessonPageContext = React.createContext<object>({});

export const QuestionList = () => {
  const { lesson } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const outerRef = useRef<HTMLUListElement>(null);

  useElementScrollRestoration({
    id: "lessons",
    scrollElementRef: outerRef,
    getKey: (location) => {
      const pathname = location.pathname.endsWith("/")
        ? location.pathname.slice(0, -1)
        : location.pathname;
      return pathname;
    },
  });

  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setListHeight(listRef.current.offsetHeight);
    }
  }, [listRef.current]);

  const location = useLocation();
  const hashId = location.hash.slice(1);
  const questionIndex = lesson.questions.findIndex(
    (q) => q.id === Number(hashId.slice(2)) // to get q-'23'
  );

  useEffect(() => {
    if (questionIndex === -1) return;
    if (!outerRef.current) return;
    setTimeout(() => {
      let el = document.getElementById(hashId);
      if (el) {
        const isLast = questionIndex === lesson.questions.length - 1;
        el.focus({ preventScroll: !isLast });
        return;
      } else {
        outerRef.current?.scrollTo(0, outerRef.current.scrollHeight);
        setTimeout(() => {
          el = document.getElementById(hashId);
          if (el) {
            el.focus();
          }
        }, 50);
      }
    }, 50);
  }, [
    questionIndex,
    outerRef.current,
    hashId,
    location.hash,
    lesson.questions.length,
  ]);

  const contextMemo = useMemo(() => ({}), []);

  return (
    <LessonPageContext.Provider value={contextMemo}>
      <div className="w-full col-start-3 row-start-1 row-span-2 flex flex-col bg-surface">
        <div className="w-full h-16 shrink-0 flex items-center px-4 justify-between space-x-8">
          <TipTapHeader lesson={lesson} />
          <div className="flex items-center space-x-2">
            <EditLesson key={lesson.id} lesson={lesson} />
            <DeleteLesson key={"delete-" + String(lesson.id)} />
          </div>
        </div>
        <div className="w-full h-12 shrink-0 flex items-center px-4 mb-1">
          <Link
            to={"questions/new"}
            className="w-full h-full px-2 flex items-center space-x-2"
          >
            <PlusIcon className="text-on-surface w-6 h-6" />
            <LabelLarge color="text-on-surface">Add Quesion</LabelLarge>
          </Link>
        </div>
        <div id={`questions-list`} ref={listRef} className="relative grow ">
          <List
            outerElementType={"ul"}
            itemKey={(index) => lesson.questions[index].id}
            outerRef={outerRef}
            height={listHeight}
            width={"w-full"}
            className="scrollbar-thin scrollbar-thumb-outline-variant"
            itemCount={lesson.questions.length}
            itemSize={100}
            itemData={lesson.questions}
            overscanCount={2}
          >
            {TipTapNav}
          </List>
        </div>
        {/* Delete Question Modal */}
      </div>
    </LessonPageContext.Provider>
  );
};

const TipTapHeader: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
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
      content: JSON.parse(lesson.name),
    },
    [lesson.id, lesson.name]
  );

  return <EditorContent editor={editor} className="h-full text-on-surface" />;
};

const TipTapNav: React.FC<ListChildComponentProps<Question[]>> = ({
  data,
  index,
  style,
}) => {
  const ctx = useContext(LessonPageContext);
  const { id, text } = data[index];
  const editor = useEditor(
    {
      editable: false,
      editorProps: {
        attributes: {
          class: "w-full h-full p-4 outline-none",
          style: "-webkit-mask-image: linear-gradient(#000 80%, transparent);",
        },
      },
      extensions: [
        History,
        Document,
        Text,
        InlineLatex,
        DisplayLatex,
        Table.configure({
          HTMLAttributes: {
            class: "w-full h-auto flex flex-col my-1",
          },
        }),
        TableRow.configure({
          HTMLAttributes: {
            class: "flex w-full h-auto",
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class:
              "w-full relative overflow-hidden pl-4 py-2 flex-col justify-center",
          },
        }),
        TableHeader,
        Bold.configure({
          HTMLAttributes: {
            class: "font-medium",
          },
        }),
        Italic.configure({
          HTMLAttributes: {
            class: "italic",
          },
        }),
        Paragraph.configure({
          HTMLAttributes: {
            class: "font-normal text-sm ltr:tracking-[0.25px]",
          },
        }),
        OrderedList.configure({
          HTMLAttributes: {
            class: "pl-4",
          },
        }),
        ListItem,
      ],
      content: JSON.parse(text),
    },
    []
  );

  if (editor) {
    console.log(editor.getHTML());
  }

  return (
    <>
      <div style={style} className="w-full px-4 pb-2 bg-surface">
        <NavLink
          draggable={false}
          id={`q-${id}`}
          to={`questions/${id}`}
          className={`w-full h-full flex flex-col items-center bg-primary/5 text-outline
        hover:bg-on-surface/[8%] focus:bg-on-surface/[12%]`}
        >
          <EditorContent
            editor={editor}
            readOnly
            className={`h-full w-full overflow-clip text-on-surface `}
          />
          {/* <div className="w-full flex justify-end text-on-surface">
            <span className="">
              <button
                className="px-3 py-2 flex items-center space-x-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <LabelMedium>Delete</LabelMedium>
              </button>
            </span>
          </div> */}
        </NavLink>
      </div>
    </>
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

const EditLesson = ({ lesson }: { lesson: Lesson }) => {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      name: lesson.name,
    },
    resolver: yupResolver(schema),
  });
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogTrigger>
      <Button
        className={`flex items-center justify-center text-sm font-normal p-1 pressed:bg-black/5`}
      >
        Edit
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
                  Edit Lesson
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
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <TextField
                        name={name}
                        value={value}
                        defaultValue={lesson.name}
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
                      Edit
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

const DeleteLesson = () => {
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
      <Button className="flex items-center justify-center text-sm font-normal p-1 pressed:bg-black/5">
        Delete
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
                  Delete lesson
                </Heading>
                <Form
                  ref={formRef}
                  onSubmit={handleSubmit(() => {
                    const formData = new FormData();
                    formData.append("lessonId", String(params.lessonId));
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
