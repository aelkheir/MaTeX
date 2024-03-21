import { JSONContent } from "@tiptap/react";

export const docToLatex = (doc: JSONContent) => {
  const latex = parseDocNode(doc);
  return latex;
};

const parseDocNode = (doc: JSONContent) => {
  let content = "";
  doc.content?.forEach((node, index, arr) => {
    const newLine = index !== arr.length - 1 ? "\n" : "";
    content += `${parseNode(node, { rightSibling: arr[index + 1] })}${newLine}`;
  });
  return `\\question ${content}`;
};

type Options = {
  rightSibling?: JSONContent;
  partLevel?: 0 | 1;
};

const parseNode = (node: JSONContent, options: Options = {}) => {
  switch (node.type) {
    case "paragraph":
      return parseParagraph(node, options);

    case "inlineLatex":
      return parseInlineLatex(node);

    case "displayLatex":
      return parseDisplayLatex(node);

    case "orderedList":
      return parseOrderdList(node, options);

    case "listItem":
      return parseListItem(node, options);

    case "text":
      return node.text;

    default:
      return "";
  }
};

const parseParagraph = (paragraph: JSONContent, options: Options = {}) => {
  let content = "";
  paragraph.content?.forEach((node, index, arr) => {
    const insertSpace = index !== arr.length - 1 ? " " : "";
    content += `${parseNode(node)}${insertSpace}`;
  });
  if (!content.trim()) return "";
  const endLine = options?.rightSibling?.type === "paragraph" ? "\n" : "";
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
  if (code.includes("\\begin{align}") || code.includes("\\begin{align*}")) {
    return code; // Return the code as-is, without wrapping in 'equation'
  } else {
    return `\\begin{equation}\n${code}\n\\end{equation}`;
  }
};

const parseOrderdList = (orderListNode: JSONContent, options: Options = {}) => {
  let content = "";
  orderListNode.content?.forEach((node, index, arr) => {
    const newLine = index !== arr.length - 1 ? "\n" : "";
    content += `  ${parseNode(node, { ...options })}${newLine}`;
  });
  if (!content.trim()) return "";
  const isVertical = orderListNode.attrs?.orientation === "vertical";
  let layout = "";
  if (isVertical) {
    layout =
      `\\begin{multicols}{${orderListNode.attrs?.gridCols}}\n` +
      `${content}` +
      "\n\\end{multicols}";
  }
  const template =
    options?.partLevel === 0 || !options.partLevel
      ? "\\begin{parts}\n{0}\n\\end{parts}"
      : "\\begin{subparts}\n{0}\n\\end{subparts}";

  return template.replace("{0}", isVertical ? layout : content);
};

const parseListItem = (listItemNode: JSONContent, options: Options = {}) => {
  let content = "";
  let uplevel = "";
  listItemNode.content?.forEach((node, index, arr) => {
    if (node.type === "listItemIntro" && index == 0) {
      uplevel = parseParagraph(node);
    }
    const newLine = index !== arr.length - 1 ? "\n" : "";
    content += `${parseNode(node, {
      rightSibling: arr[index + 1],
      partLevel: 1,
    })}${newLine}`;
  });

  if (!content.trim()) return "";

  const part =
    options?.partLevel === 0 || !options.partLevel
      ? `\\part ${content}`
      : `\\subpart ${content}`;

  return (uplevel ? `\\uplevel{${uplevel}}\n` : "") + part;
};
