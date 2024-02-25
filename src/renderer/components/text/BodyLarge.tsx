import { BodyTextProps } from "./types";

export const BodyLarge = ({
  className,
  children,
  weight,
  color,
  ...props
}: BodyTextProps) => {
  const fontWeight = weight ? weight : "font-normal";
  color = color ? color : "text-inherit";
  return (
    <p
      {...props}
      className={`text-base text-inherit ltr:tracking-[0.5px] ${fontWeight} ${color} ${className}`}
    >
      {children}
    </p>
  );
};
