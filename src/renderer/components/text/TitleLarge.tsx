import { TitleTextProps } from "./types";

export const TitleLarge = ({
  children,
  className,
  weight,
  color,
  ...props
}: TitleTextProps) => {
  const fontWeight = weight ? weight : "font-normal";
  color = color ? color : "text-inherit";
  return (
    <span
      {...props}
      className={`text-[22px] leading-7 ${fontWeight} ${color} ${className}`}
    >
      {children}
    </span>
  );
};
