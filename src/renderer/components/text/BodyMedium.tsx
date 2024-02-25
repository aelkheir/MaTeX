import { BodyTextProps } from "./types";

export const BodyMedium = ({
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
      className={`text-sm ltr:tracking-[0.25px] ${fontWeight} ${color} ${className}`}
    >
      {children}
    </p>
  );
};
