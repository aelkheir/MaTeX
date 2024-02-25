import { LabelTextProps } from "./types";

export const LabelMedium = ({
  className,
  children,
  weight,
  color,
  ...props
}: LabelTextProps) => {
  const fontWeight = weight ? weight : "font-medium";
  color = color ? color : "text-inherit";
  return (
    <span
      {...props}
      className={`text-xs  ltr:tracking-[0.5px] ${fontWeight} ${color} ${className}`}
    >
      {children}
    </span>
  );
};
