import { BodyTextProps } from "./types";

export const BodySmall = ({
  className,
  children,
  weight,
  color,
  ...props
}: BodyTextProps) => {
  const fontWeight = weight ? weight : "font-normal";
  color = color ? color : "text-on-background";
  return (
    <p
      {...props}
      className={`text-xs ltr:tracking-[0.4px] ${fontWeight} ${color} ${className}`}
    >
      {children}
    </p>
  );
};
