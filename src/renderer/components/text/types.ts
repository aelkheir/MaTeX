export interface TextComponent {
  weight?: string;
  color?: string;
}

export interface BodyTextProps
  extends React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLParagraphElement>,
      HTMLParagraphElement
    >,
    TextComponent {}

export interface HeadlineTextProps
  extends React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >,
    TextComponent {}

export interface LabelTextProps
  extends React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLSpanElement>,
      HTMLSpanElement
    >,
    TextComponent {}

export interface TitleTextProps
  extends React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLSpanElement>,
      HTMLSpanElement
    >,
    TextComponent {}
