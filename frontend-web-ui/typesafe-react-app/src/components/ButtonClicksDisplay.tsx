import { useSelector } from "react-redux";
import { CountersSelector } from "../app/features/counters/CountersSlice";

export const ButtonClicksDisplay: React.FC<any> = () => {
  const buttonClickCount = useSelector(CountersSelector.getButtonClicks);

  console.log(buttonClickCount);

  return <>{buttonClickCount}</>;
};
