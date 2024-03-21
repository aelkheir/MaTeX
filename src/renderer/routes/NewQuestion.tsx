import React, { useRef, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import {
  ActionFunctionArgs,
  Form,
  Link,
  redirect,
  useBlocker,
  useNavigate,
  useSubmit,
} from "react-router-dom";
import { EditorContent, generateText, useEditor } from "@tiptap/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import { History } from "@tiptap/extension-history";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import Focus from "@tiptap/extension-focus";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Controller,
  RefCallBack,
  UseFormGetValues,
  useForm,
} from "react-hook-form";
import * as yup from "yup";
import { DisplayLatex, InlineLatex } from "../components/tiptap/LatexNode";
import {
  ListItem,
  ListItemIntro,
  OrderedList,
} from "../components/tiptap/OrderedList";
import {
  Button,
  Dialog,
  FieldError,
  Heading,
  Input,
  Modal,
  ModalOverlay,
  TextField,
} from "react-aria-components";
import { LabelLarge } from "../components/text/LabelLarge";
import { Menu } from "../components/tiptap/Menu";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  switch (request.method) {
    case "POST":
      const question = await window.electron.addQuestion(
        Number(params.lessonId),
        String(updates.editorContent)
      );
      return redirect(
        `/courses/${params.courseId}/units/${params.unitId}/lessons/${params.lessonId}/#q-${question.id}`
      );
  }
  return null;
}

export const NewQuestion = () => {
  return (
    <div className="w-full h-full col-start-3 row-start-1 row-span-2 flex flex-col bg-background">
      <div className="w-full h-16 shrink-0 flex items-center justify-between px-4 text-on-surface">
        <div className="flex space-x-2 ">
          <Link
            to={`../../`}
            relative="path"
            className="flex justify-center items-start p-1"
            aria-label="Navigate Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
        </div>
      </div>
      <NewQuestionForm />
    </div>
  );
};

const schema = yup.object({
  editorContent: yup.string().test({
    name: "value",
    skipAbsent: true,
    test(value, ctx) {
      if (value === "") {
        return ctx.createError({ message: "Required" });
      }
      const text = generateText(JSON.parse(value), [
        Document,
        Text,
        HardBreak,
        InlineLatex,
        DisplayLatex,
        Bold,
        Italic,
        Paragraph,
        OrderedList,
        ListItem,
        ListItemIntro,
        Table,
        TableRow,
        TableCell,
        TableHeader,
      ]);
      if (text === "") {
        return ctx.createError({ message: "Required" });
      }
      if (text.length > 0 && text.length < 10) {
        return ctx.createError({
          message: "Question must at least be 10 characters long",
        });
      }
      return true;
    },
  }),
});

const NewQuestionForm: React.FC = () => {
  const submit = useSubmit();
  const { control, handleSubmit, getValues } = useForm({
    defaultValues: {
      editorContent: "",
    },
    resolver: yupResolver(schema),
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = () => {
    submit(formRef.current, {
      method: "POST",
    });
  };

  return (
    <Form ref={formRef} className="w-full grow flex flex-col">
      <Controller
        name="editorContent"
        control={control}
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error },
        }) => (
          <TextField
            name={name}
            aria-label="Question content"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            autoFocus
            isRequired
            // // Let React Hook Form handle validation instead of the browser.
            validationBehavior="aria"
            isInvalid={invalid}
            className={"grow flex flex-col"}
          >
            <TipTap content={value} onChange={onChange} contentRef={ref} />
            <Input ref={ref} hidden />

            <FieldError className={"px-4 shrink-0 text-sm"}>
              {error?.message}
            </FieldError>
          </TextField>
        )}
      />
      <div>
        <div className="h-16 px-8 shrink-0 w-full flex justify-end items-center">
          <div className="h-full flex items-center">
            <span className="bg-surface mr-2">
              <Link
                to={`../..`}
                relative="path"
                className="py-3 px-4  text-on-surface flex justify-center items-center"
              >
                <LabelLarge>Discard</LabelLarge>
              </Link>
            </span>
            <span className="bg-surface">
              <Button
                className="py-3 px-4 text-on-surface bg-primary/[12%] flex justify-center items-center"
                onPress={() => handleSubmit(onSubmit)()}
              >
                Save
              </Button>
            </span>
          </div>
        </div>
      </div>
      <EditBlocker getValues={getValues} />
    </Form>
  );
};

const TipTap = ({
  content,
  onChange,
  contentRef,
}: {
  content: string;
  onChange: (...event: unknown[]) => void;
  contentRef: RefCallBack;
}) => {
  const navigate = useNavigate();
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "w-full h-full outline-none",
      },
    },
    extensions: [
      History,
      Document,
      Text,
      HardBreak,
      InlineLatex,
      DisplayLatex,
      Table.configure({
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableCell,
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
          class: "font-normal text-base",
        },
      }),
      OrderedList,
      ListItem,
      ListItemIntro,
      Focus.configure({
        className: "ring-[1px] ring-primary",
        mode: "all",
      }),
      Gapcursor,
    ],
    content: !content ? "<p></p>" : JSON.parse(content),
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  const [prevEditor, setPrevEditor] = useState(editor);

  if (!prevEditor && editor) {
    editor?.chain().focus("end").run();
    setPrevEditor(editor);
  }

  return (
    <>
      <div className="w-full shrink-0 flex flex-wrap items-center space-x-0.5 px-4 bg-black/[1%] p-1">
        <Menu editor={editor} />
      </div>
      <div className="w-full grow relative overflow-auto flex flex-col">
        <EditorContent
          editor={editor}
          ref={contentRef}
          className="p-4 text-on-background absolute inset-0 "
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              navigate(`../../`, { relative: "path" });
            }
          }}
        />
      </div>
    </>
  );
};

const EditBlocker = ({
  getValues,
}: {
  getValues: UseFormGetValues<{
    editorContent?: string;
  }>;
}) => {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    let editorContent = getValues().editorContent;
    if (getValues().editorContent !== "") {
      editorContent = generateText(JSON.parse(editorContent), [
        Document,
        Text,
        HardBreak,
        InlineLatex,
        DisplayLatex,
        Bold,
        Italic,
        Paragraph,
        OrderedList,
        ListItem,
        ListItemIntro,
        Table,
        TableRow,
        TableCell,
        TableHeader,
      ]);
    }
    return (
      editorContent !== "" && currentLocation.pathname !== nextLocation.pathname
    );
  });
  return (
    <ModalOverlay
      isOpen={blocker.state === "blocked"}
      className={`
          fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4`}
    >
      <Modal
        isOpen={blocker.state === "blocked"}
        className={`w-full max-w-md overflow-hidden bg-white p-6 text-left align-middle`}
      >
        <Dialog role="dialog" className="outline-none relative">
          {({ close }) => (
            <>
              <Heading
                slot="title"
                className="text-xxl font-semibold leading-6 my-0 text-slate-700"
              >
                Discard Changes
              </Heading>
              <div className="mt-2">
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    onPress={() => {
                      blocker.reset();
                      close();
                    }}
                    className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-slate-200 text-slate-800 hover:border-slate-300 pressed:bg-slate-300`}
                  >
                    Continue Editing
                  </Button>
                  <Button
                    onPress={blocker.proceed}
                    className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-red-500 text-white hover:border-red-600 pressed:bg-red-600`}
                  >
                    Discard
                  </Button>
                </div>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};
