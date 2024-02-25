import React, { useEffect } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  redirect,
  To,
  useLoaderData,
} from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Unit as UnitModel, Lesson as LessonModel } from "../../main/entities";
import { useHover } from "react-aria";
import { InlineLatex } from "../components/tiptap/LatexNode";

export async function loader({ params }: LoaderFunctionArgs) {
  const unit = await window.electron.fetchUnit(Number(params.unitId));
  return { unit };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  switch (request.method) {
    case "POST":
      await window.electron.editUnit({
        id: Number(params.unitId),
        name: updates.name,
      } as UnitModel);
      break;

    case "DELETE":
      await window.electron.deleteUnit(Number(updates.unitId));
      return redirect("/");

    case "PUT":
      const lesson = await window.electron.addLesson(
        Number(params.unitId),
        updates.name as string
      );
      return redirect(`/units/${params.unitId}/lessons/${lesson.id}`);
  }
  return null;
}

export const LessonList = () => {
  const { unit } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <>
      <div className="col-start-2 row-start-1 row-span-2 flex w-full">
        <div className="relative w-full bg-surface">
          <div className="w-full h-full bg-primary/5  rounded-r-md flex flex-col">
            <div className="w-full shrink-0 h-16 flex items-center px-4 justify-between space-x-2">
              <TipTapHeader unit={unit} key={unit.id} />
            </div>

            <div className="w-full h-12 shrink-0 flex items-center px-4 mb-1">
              {/* <NewLessonTrigger /> */}
            </div>
            <div className="px-4 grow relative overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant scroll-smooth space-y-1">
              {unit.lessons?.map((lesson) => (
                <TipTapNav
                  key={lesson.id}
                  json={lesson.name}
                  to={`lessons/${lesson.id}`}
                  lesson={lesson}
                />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface z-[5] pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-primary/5 z-[8] pointer-events-none" />
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

const TipTapHeader: React.FC<{ unit: UnitModel }> = ({ unit }) => {
  const editor = useEditor({
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
  });

  useEffect(() => {
    editor?.commands.setContent(JSON.parse(unit.name));
  }, [unit.id, unit.name]);

  return <EditorContent editor={editor} className="h-full text-on-surface" />;
};

const TipTapNav: React.FC<{
  json: string;
  to: To;
  lesson: LessonModel;
}> = ({ json, to, lesson }) => {
  const { hoverProps, isHovered } = useHover({});
  const editor = useEditor({
    editable: false,
    editorProps: {
      attributes: {
        class: "h-full flex items-center p-4 outline-none",
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
      id={`l-${lesson.id}`}
      draggable={false}
      to={to}
      {...hoverProps}
      className={({ isActive }) =>
        `w-full flex items-center ${
          isActive
            ? "bg-surface sticky z-10 top-0 bottom-2 text-on-surface"
            : " text-outline"
        }`
      }
    >
      {({ isActive }) => (
        <EditorContent
          editor={editor}
          className={`h-full w-full ${
            isActive || isHovered ? "bg-black bg-opacity-10" : ""
          }`}
        />
      )}
    </NavLink>
  );
};
