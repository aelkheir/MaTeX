import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionFunctionArgs,
  Link,
  LoaderFunctionArgs,
  NavLink,
  redirect,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { PlusIcon } from "@heroicons/react/24/solid";
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
import { LabelMedium } from "../components/text/LabelMedium";

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
      if ("lessonId" in updates) {
        await window.electron.deleteLesson(Number(updates.lessonId));
        return redirect(`/units/${params.unitId}`);
      } else if ("questionId" in updates) {
        await window.electron.deleteQuestion(Number(updates.questionId));
        return null;
      }
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
          <div className="flex space-x-2">
            <button className="py-3 px-4 text-on-surface">
              <LabelLarge>Delete</LabelLarge>
            </button>
            <button className="py-3 px-4 text-on-surface">
              <LabelLarge>Edit</LabelLarge>
            </button>
          </div>

          {/* Edit Lesson Modal */}

          {/* Delete Lesson Modal */}
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
            itemSize={150}
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
  const isLast = index === data.length - 1;
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
          <div className="w-full flex justify-end text-on-surface">
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
          </div>
        </NavLink>
      </div>
    </>
  );
};
