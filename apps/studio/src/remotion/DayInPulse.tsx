import { AbsoluteFill, Series } from "remotion";
import { color } from "./tokens";
import { fonts } from "./fonts";
import { Commessa } from "./scenes/Commessa";
import { Timesheet } from "./scenes/Timesheet";
import { Forecast } from "./scenes/Forecast";
import { Kudos } from "./scenes/Kudos";
import { Focus } from "./scenes/Focus";
import { Copilot } from "./scenes/Copilot";
import { Snap } from "./scenes/Snap";
import { Grid } from "./components/Grid";
import { Wordmark } from "./components/Wordmark";

/**
 * "Un giorno in Pulse" — 12s · 30fps · 360 frames at 1280×720.
 * Seven scenes narrate the daily loop of a services team on Pulse HR.
 */
export const DayInPulse: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
      }}
    >
      <Grid />

      <AbsoluteFill style={{ top: 36, left: 48, right: 48, bottom: 36 }}>
        <Wordmark />

        <Series>
          <Series.Sequence durationInFrames={45} name="Commessa">
            <Commessa />
          </Series.Sequence>
          <Series.Sequence durationInFrames={60} offset={-8} name="Timesheet">
            <Timesheet />
          </Series.Sequence>
          <Series.Sequence durationInFrames={55} offset={-8} name="Forecast">
            <Forecast />
          </Series.Sequence>
          <Series.Sequence durationInFrames={50} offset={-8} name="Kudos">
            <Kudos />
          </Series.Sequence>
          <Series.Sequence durationInFrames={50} offset={-8} name="Focus">
            <Focus />
          </Series.Sequence>
          <Series.Sequence durationInFrames={65} offset={-8} name="Copilot">
            <Copilot />
          </Series.Sequence>
          <Series.Sequence durationInFrames={65} offset={-8} name="Snap">
            <Snap />
          </Series.Sequence>
        </Series>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
