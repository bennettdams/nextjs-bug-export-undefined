import { revalidateInSeconds } from "../pages";

export function TestComponent(): JSX.Element {
  console.log("revalidateInSeconds: ", revalidateInSeconds);
  return <p>Test component</p>;
}
