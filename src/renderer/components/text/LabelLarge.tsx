import { LabelTextProps } from "./types";

export const LabelLarge = ({
  className,
  children,
  weight,
  color,
  ...props
}: LabelTextProps) => {
  const fontWeight = weight ? weight : "font-medium";
  color = color ? color : "text-inherit";
  className = className ? className : "";
  return (
    <span
      {...props}
      className={`text-sm ltr:tracking-[0.1px] ${fontWeight} ${color} ${className}`}
    >
      {children}
    </span>
  );
};
