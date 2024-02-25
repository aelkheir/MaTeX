import { NodeViewWrapper, Editor } from "@tiptap/react";
import katex from "katex";
import { Node } from "prosemirror-model";

interface LatexNodeViewProps {
  node: Node;
  editor: Editor;
}

export const LatexNodeView = ({ node, editor }: LatexNodeViewProps) => {
  const { display } = node.attrs;

  const html = katex.renderToString(`${node.attrs.code}`, {
    displayMode: node.attrs.display,
    throwOnError: false,
  });

  const containerStyles = display
    ? "flex justify-center w-11/12 mx-auto"
    : `inline-flex items-center w-auto`;

  return (
    <>
      <NodeViewWrapper
        as={"span"}
        className={`${containerStyles} ${
          editor.isEditable
            ? "cursor-pointer hover:bg-black/10"
            : "pointer-events-none block"
        }`}
      >
        {node.attrs.code ? (
          <span
            dangerouslySetInnerHTML={{ __html: html }}
            className={`text-inherit flex`}
            // contentEditable={true}
          />
        ) : (
          <span className={`italic text-center text-xs`}>Type in code.</span>
        )}
      </NodeViewWrapper>
    </>
  );
};
