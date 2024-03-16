import { JSONContent } from "@tiptap/react";

export const docToLatex = (doc: JSONContent) => {
  const latex = parseDocNode(doc);
  return latex;
};

const parseDocNode = (doc: JSONContent) => {
  let content = "";
  doc.content?.forEach((node, index, arr) => {
    const newLine = index !== arr.length - 1 ? "\n" : "";
    content += `${parseNode(node, arr[index + 1])}${newLine}`;
  });
  return `\\question ${content}`;
};

const parseNode = (node: JSONContent, rightSibling?: JSONContent) => {
  switch (node.type) {
    case "paragraph":
      return parseParagraph(node, rightSibling);

    case "inlineLatex":
      return parseInlineLatex(node);

    case "displayLatex":
      return parseDisplayLatex(node);

    case "orderedList":
      return parseOrderdList(node);

    case "listItem":
      return parseListItem(node);

    case "text":
      return node.text;

    default:
      return "";
  }
};

const parseParagraph = (paragraph: JSONContent, rightSibling?: JSONContent) => {
  let content = "";
  paragraph.content?.forEach((node, index, arr) => {
    const insertSpace = index !== arr.length - 1 ? " " : "";
    content += `${parseNode(node)}${insertSpace}`;
  });
  if (!content.trim()) return "";
  const endLine = rightSibling?.type === "paragraph" ? "\n" : "";
  return `${content}${endLine}`;
};

const parseInlineLatex = (inlineLatexNode: JSONContent) => {
  const code = inlineLatexNode.attrs?.code;
  if (!String(code).trim()) return "";
  return `$${code}$`;
};

const parseDisplayLatex = (DisplayLatexNode: JSONContent) => {
  const code = DisplayLatexNode.attrs?.code;
  if (!String(code).trim()) return "";
  return `\\begin{equation}\n${code}\n\\end{equation}`;
};

const parseOrderdList = (orderListNode: JSONContent) => {
  let content = "";
  orderListNode.content?.forEach((node, index, arr) => {
    const newLine = index !== arr.length - 1 ? "\n" : "";
    content += `  ${parseNode(node)}${newLine}`;
  });
  if (!content.trim()) return "";
  const isVertical = orderListNode.attrs.orientation === "vertical";
  let layout = "";
  if (isVertical) {
    layout =
      `\\begin{multicols}{${orderListNode.attrs.gridCols}}\n` +
      `${content}` +
      "\n\\end{multicols}";
  }

  return `\\begin{parts}\n${isVertical ? layout : content}\n\\end{parts}`;
};

const parseListItem = (listItemNode: JSONContent) => {
  let content = "";
  listItemNode.content?.forEach((node, index, arr) => {
    const newLine = index !== arr.length - 1 ? "\n" : "";
    content += `${parseNode(node, arr[index + 1])}${newLine}`;
  });
  if (!content.trim()) return "";
  return `\\part ${content}`;
};
