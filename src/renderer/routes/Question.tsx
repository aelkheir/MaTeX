import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { EditorContent, useEditor, generateText } from "@tiptap/react";
import { useRef, useState } from "react";
import { useForm, Controller, RefCallBack } from "react-hook-form";
import {
  ActionFunctionArgs,
  Form,
  Link,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
  useSubmit,
} from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import { History } from "@tiptap/extension-history";
import { ListItem } from "@tiptap/extension-list-item";
import Focus from "@tiptap/extension-focus";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import * as yup from "yup";
import { Question as QuestionModel } from "../../main/entities";
import { DisplayLatex, InlineLatex } from "../components/tiptap/LatexNode";
import {
  Button,
  Dialog,
  DialogTrigger,
  FieldError,
  Heading,
  Input,
  Modal,
  ModalOverlay,
  TextField,
} from "react-aria-components";
import { LabelLarge } from "../components/text/LabelLarge";
import { OrderedList } from "../components/tiptap/OrderedList";
import { Menu } from "../components/tiptap/Menu";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  switch (request.method) {
    case "POST":
      const question = await window.electron.editQuestion({
        id: Number(params.questionId),
        text: updates.editorContent,
      } as QuestionModel);
      return redirect(
        `/courses/${params.courseId}/units/${params.unitId}/lessons/${params.lessonId}/#q-${question.id}`
      );
    case "DELETE":
      await window.electron.deleteQuestion(Number(updates.questionId));
      return redirect(
        `/courses/${params.courseId}/units/${params.unitId}/lessons/${params.lessonId}`
      );
  }
  return null;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const question = await window.electron.fetchQuestion(
    Number(params.questionId)
  );
  return { question };
}

export const Question = () => {
  const { question } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <div className="w-full h-full col-start-3 row-start-1 row-span-2 flex flex-col bg-background">
      <div className="w-full h-16 shrink-0 flex items-center justify-between px-4 text-on-surface">
        <div className="flex space-x-2">
          <Link
            to={`../../#q-${question.id}`}
            relative="path"
            preventScrollReset={true}
            className="flex justify-center items-start p-1"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
        </div>
      </div>
      <EditQuestionForm question={question} />
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

const EditQuestionForm = ({ question }: { question: QuestionModel }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      editorContent: question.text,
    },
    resolver: yupResolver(schema),
  });
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = () => {
    if (formRef.current) {
      submit(formRef.current, {
        method: "POST",
      });
    }
  };

  return (
    <Form ref={formRef} className="w-full grow flex flex-col">
      {/* @ts-ignore */}
      <Controller
        name="editorContent"
        control={control}
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error },
        }) => (
          <TextField
            aria-label="Question content"
            name={name}
            value={value}
            defaultValue={question.text}
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
            <FieldError className={"px-4 shrink-0 text-xs"}>
              {error?.message}
            </FieldError>
          </TextField>
        )}
      />
      <div>
        <div className="px-8 shrink-0 w-full text-error">
          {errors.editorContent?.message}
        </div>
        <div className="h-16 px-8 shrink-0 w-full flex justify-between items-center space-x-2">
          <div className="h-full flex items-center">
            <span className="bg-surface">
              <DeleteQuestion question={question} />
            </span>
          </div>
          <div className="h-full flex items-center">
            <span className="bg-surface mr-2">
              <Link
                to={`../../`}
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

      {/* Delete Modal */}
    </Form>
  );
};

const DeleteQuestion = ({ question }: { question: QuestionModel }) => {
  const submit = useSubmit();
  const handleDelete = () => {
    const formData = new FormData();
    formData.append("questionId", String(question.id));
    submit(formData, { method: "DELETE" });
  };

  return (
    <DialogTrigger>
      <Button
        type="button"
        className="py-3 px-4 text-on-surface flex justify-center items-center font-normal"
      >
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
                  Delete Question
                </Heading>
                <div className="mt-2">
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      onPress={close}
                      className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-slate-200 text-slate-800 hover:border-slate-300 pressed:bg-slate-300`}
                    >
                      Cancel
                    </Button>
                    <Button
                      onPress={handleDelete}
                      className={`inline-flex justify-center border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2 bg-red-500 text-white hover:border-red-600 pressed:bg-red-600`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
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
  const params = useParams();
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
        HTMLAttributes: {
          class: "w-full h-auto flex flex-col my-1",
        },
        allowTableNodeSelection: true,
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
          class: "font-normal text-base",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          // padding when the list the top child of the doc
          class: "pl-5",
        },
      }),
      Focus.configure({
        className: "ring-[1px] ring-primary",
        mode: "all",
      }),
      ListItem,
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
      <div className="w-full h-12 shrink-0 flex flex-wrap items-center space-x-1 px-4 bg-black/[1%] p-1">
        <Menu editor={editor} />
      </div>
      <div className="w-full grow relative overflow-auto flex flex-col">
        <EditorContent
          editor={editor}
          ref={contentRef}
          className="p-4 text-on-background absolute inset-0 "
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              navigate(`../../#q-${params.questionId}`, { relative: "path" });
            }
          }}
        />
      </div>
    </>
  );
};
