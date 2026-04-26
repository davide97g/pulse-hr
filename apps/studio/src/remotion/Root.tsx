import { Composition } from "remotion";
import { DayInPulse } from "./DayInPulse";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DayInPulse"
      component={DayInPulse}
      durationInFrames={360}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
