import { TitleTextProps } from "./types";

export const TitleMedium = ({
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
      className={`text-base leading-7 ltr:tracking-[0.15px] ${fontWeight} ${color} ${className}`}
    >
      {children}
    </span>
  );
};
