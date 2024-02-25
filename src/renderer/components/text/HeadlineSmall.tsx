import { HeadlineTextProps } from "./types";

export const HeadlineSmall = ({
  className,
  children,
  weight,
  color,
  ...props
}: HeadlineTextProps) => {
  const fontWeight = weight ? weight : "font-normal";
  color = color ? color : "text-inherit";
  return (
    <h3 {...props} className={`text-2xl ${fontWeight} ${color} ${className}`}>
      {children}
    </h3>
  );
};
