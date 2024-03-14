import { EditorContent, useEditor } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import { DisplayLatex, InlineLatex } from "../components/tiptap/LatexNode";
import {
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
} from "react-router-dom";
import { TableCell as TipTapTableCell } from "@tiptap/extension-table-cell";
import { ListItem } from "@tiptap/extension-list-item";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { TableRow as TipTapTableRow } from "@tiptap/extension-table-row";
import { TableHeader as TipTapTableHeader } from "@tiptap/extension-table-header";
import { Table as TipTapTable } from "@tiptap/extension-table";
import { Question } from "../../main/entities";
import { memo, useDeferredValue, useEffect, useRef, useState } from "react";
import { useElementScrollRestoration } from "../hooks/useElementScrollRestoration";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import {
  Button,
  Group,
  Input,
  Label,
  SearchField,
} from "react-aria-components";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

export async function loader({ params }: LoaderFunctionArgs) {
  const questions = await window.electron.fetchCourseQuestions(
    +params.courseId
  );
  return { questions };
}

export const ExamQuestionList = () => {
  const { questions } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <div className="pl-4 col-start-2 row-start-1 w-full h-full">
        <SearchField
          className={"w-full flex flex-col gap-1 [&[data-empty]_button]:hidden"}
          value={query}
          onChange={setQuery}
        >
          <Label className="text-xs">Search</Label>
          <Group className="h-8 flex items-center bg-gray-300 grow outline-none border-b-2 border-transparent focus-within:border-primary bg-black/5">
            <span className="p-1">
              <MagnifyingGlassIcon className="w-4 h-4 text-on-background" />
            </span>
            <Input
              placeholder="Search questions, lessons, unit..."
              className={
                "grow py-1 pr-2 border-none bg-transparent outline-none text-sm placeholder:italic placeholder:text-outline [&::-webkit-search-cancel-button]:hidden"
              }
            />
            <Button className={"p-1 empty:hidden"}>
              <XMarkIcon className="w-4 h-4 text-on-background" />
            </Button>
          </Group>
        </SearchField>
      </div>
      <div className="col-start-1 col-span-2 row-start-2 w-full h-full flex flex-col pl-4">
        <QuestionList questions={questions} deferredQuery={deferredQuery} />
      </div>
      <Outlet />
    </>
  );
};

const QuestionList = memo(function QuestionList({
  questions,
  deferredQuery,
}: {
  questions: Question[];
  deferredQuery: string;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const outerRef = useRef<HTMLUListElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const params = useParams();

  useEffect(() => {
    if (listRef.current) {
      setListHeight(listRef.current.offsetHeight);
    }
  }, [listRef.current, outerRef.current]);

  useEffect(() => {
    if (outerRef.current) {
      const scrollbarWidth =
        outerRef.current.offsetWidth - outerRef.current.clientWidth;
      setScrollbarWidth(scrollbarWidth);
    }
  }, [outerRef.current]);

  useElementScrollRestoration({
    id: "lessons",
    scrollElementRef: outerRef,
    getKey: (location) => {
      const pathname = location.pathname.endsWith("/")
        ? location.pathname.slice(0, -1)
        : location.pathname;
      return pathname + params.courseId;
    },
  });

  const location = useLocation();
  const hashId = location.hash.slice(1);
  const questionIndex = questions.findIndex(
    (q) => q.id === Number(hashId.slice(2)) // to get q-'23'
  );

  useEffect(() => {
    if (questionIndex === -1) return;
    if (!outerRef.current) return;
    setTimeout(() => {
      let el = document.getElementById(hashId);
      if (el) {
        const isLast = questionIndex === questions.length - 1;
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
    questions.length,
  ]);

  console.time("filter array");
  const filteredQuestions = deferredQuery
    ? filter({ query: deferredQuery, questions })
    : questions;
  console.timeEnd("filter array");

  return (
    <>
      <div className="flex py-1" style={{ marginRight: scrollbarWidth }}>
        <div className="basis-2/3 grow-0 text-xs">Question</div>
        <div className="basis-1/3 px-2  grow-0 text-xs">Unit</div>
      </div>
      {questions.length ? (
        <div id={`questions-list`} ref={listRef} className="relative grow">
          <List
            outerElementType={"ul"}
            itemKey={(index) => filteredQuestions[index].id}
            outerRef={outerRef}
            height={listHeight}
            width={"w-full"}
            itemCount={filteredQuestions.length}
            itemSize={100}
            itemData={filteredQuestions}
            overscanCount={2}
          >
            {Row}
          </List>
        </div>
      ) : null}
    </>
  );
});

const Row = ({ data, index, style }: ListChildComponentProps<Question[]>) => {
  const bgColor = index % 2 === 0 ? "bg-black/[5%]" : "transparent";
  return (
    <div className={`flex w-full ${bgColor}`} style={style}>
      <div className="basis-2/3 grow-0 overflow-hidden text-sm">
        <TipTapQuestion data={data} index={index} />
      </div>
      <div className="basis-1/3 grow-0 flex flex-col text-xs p-2">
        <TipTapName content={data[index].lesson.unit.name} />
        <TipTapName content={data[index].lesson.name} />
      </div>
    </div>
  );
};

const TipTapQuestion = ({
  data,
  index,
}: Omit<ListChildComponentProps<Question[]>, "style">) => {
  const { id, text } = data[index];
  const editor = useEditor({
    editable: false,
    editorProps: {
      attributes: {
        class: "w-full h-full outline-none",
        style: "-webkit-mask-image: linear-gradient(#000 80%, transparent);",
      },
    },
    extensions: [
      Document,
      Text,
      InlineLatex,
      DisplayLatex,
      TipTapTable.configure({
        HTMLAttributes: {
          class: "w-full h-auto flex flex-col my-1",
        },
      }),
      TipTapTableRow.configure({
        HTMLAttributes: {
          class: "flex w-full h-auto",
        },
      }),
      TipTapTableCell.configure({
        HTMLAttributes: {
          class: "w-full relative overflow-hidden flex-col justify-center",
        },
      }),
      TipTapTableHeader,
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
          class: "font-normal text-inherit ltr:tracking-[0.25px]",
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
  });

  return (
    <div className="w-full h-full px-4 py-2">
      <NavLink
        draggable={false}
        id={`q-${id}`}
        to={`questions/${id}`}
        className={`w-full h-full flex flex-col items-center text-outline
        cursor-default`}
      >
        <EditorContent
          editor={editor}
          readOnly
          contentEditable={false}
          className={`h-full w-full overflow-clip text-on-surface `}
        />
      </NavLink>
    </div>
  );
};

const TipTapName = ({ content }: { content: string }) => {
  const editor = useEditor({
    editable: false,
    editorProps: {
      attributes: {
        class: "flex items-center outline-none",
      },
    },
    extensions: [
      Document.extend({
        content: "block",
      }),
      Text,
      Paragraph.configure({
        HTMLAttributes: {
          class: "text-inherit font-normal line-clamp-1",
        },
      }),
      InlineLatex,
    ],
    content: JSON.parse(content),
  });

  return (
    <div
      className={`text-outline focus:outline-none focus-visible:ring-2 ring-inset ring-outline selected:bg-black/5 selected:sticky selected:z-10 selected:top-0 selected:bottom-0 left-0 selected:text-on-surface cursor-default`}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

function filter({
  query,
  questions,
}: {
  query: string;
  questions: Question[];
}) {
  query = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const regex = new RegExp(query, "i");
  return questions.filter((question) => {
    return (
      regex.test(question.lesson.unit.name) ||
      regex.test(question.lesson.name) ||
      regex.test(question.text)
    );
  });
}
