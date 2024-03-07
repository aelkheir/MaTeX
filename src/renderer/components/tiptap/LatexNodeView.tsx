import { NodeViewWrapper, Editor } from "@tiptap/react";
import katex from "katex";
import { Node } from "prosemirror-model";
import {
  Button,
  Dialog,
  DialogTrigger,
  Form,
  Input,
  Label,
  Popover,
  TextField,
} from "react-aria-components";

interface LatexNodeViewProps {
  node: Node;
  selected: boolean;
  editor: Editor;
  getPos: () => number;
  updateAttributes: (attrs: Node["attrs"]) => void;
  deleteNode: () => void;
}

export const LatexNodeView = ({
  node,
  editor,
  getPos,
  deleteNode,
  updateAttributes,
}: LatexNodeViewProps) => {
  const { display, code, formOpen } = node.attrs;

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
        <DialogTrigger
          isOpen={formOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              editor
                .chain()
                .focus(getPos() + node.nodeSize)
                .run();
              if (!code) deleteNode();
            }
            updateAttributes({ formOpen: isOpen });
          }}
        >
          <Button excludeFromTabOrder>
            {node.attrs.code ? (
              <span
                dangerouslySetInnerHTML={{ __html: html }}
                className={`text-inherit flex`}
              />
            ) : (
              <span className={`italic text-center text-xs`}>
                Type in code.
              </span>
            )}
          </Button>
          <Popover
            placement="bottom"
            className={`
        group w-60 ring-1 ring-black/10 bg-white`}
          >
            <Dialog
              className="outline-none text-gray-700 w-full flex flex-col gap-1"
              aria-label="Level"
            >
              {({ close }) => (
                <Form className="flex flex-col gap-2" onSubmit={close}>
                  <TextField
                    name="name"
                    type="text"
                    autoFocus
                    className={"flex flex-col"}
                    value={code}
                    onChange={(value) => {
                      updateAttributes({
                        ...node.attrs,
                        code: value,
                      });
                    }}
                  >
                    <Label className="px-1 text-sm">LaTeX Code</Label>
                    <Input
                      className={
                        "px-2 py-1 bg-gray-300 grow outline-none border-b-2 border-transparent focus:border-primary text-sm"
                      }
                    />
                  </TextField>
                </Form>
              )}
            </Dialog>
          </Popover>
        </DialogTrigger>
      </NodeViewWrapper>
    </>
  );
};
