import { useRouteError } from "react-router-dom";
import { BodyLarge } from "../components/text/BodyLarge";

export default function Error() {
  const error = useRouteError() as unknown;
  console.error(error);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center space-y-2">
      <BodyLarge>Oops!</BodyLarge>
      <BodyLarge>Sorry, an unexpected error has occurred.</BodyLarge>
    </div>
  );
}
