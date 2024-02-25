import { TitleTextProps } from "./types";

export const TitleSmall = ({
  children,
  className,
  weight,
  color,
  ...props
}: TitleTextProps) => {
  const fontWeight = weight ? weight : "font-medium ";
  color = color ? color : "text-inherit";
  return (
    <span
      {...props}
      className={`text-sm tracking-[0.1px] ${fontWeight} ${color} ${className}`}
    >
      {children}
    </span>
  );
};
