import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../../tokens";
import { fonts } from "../../fonts";
import { GrainGradientUnderlay, GodRaysSting } from "../shaders";

interface Props {
  /** Path under studio/captures/, e.g. "captures/aura-dashboard/clip.mp4". */
  capturePath: string;
  /** Total length of this beat in frames at the composition's fps. */
  durationFrames: number;
  /** Offset into the source clip in seconds — start the clip mid-recording. */
  clipStartSeconds?: number;
  /** Optional uppercase chip shown briefly in the top-left. */
  chip?: string;
  /** Aspect-aware crop / framing. */
  aspect: "1080" | "shorts";
  /** Pop a brief GodRays sting on send / celebrate moments. */
  sting?: boolean;
}

const ENTER_FRAMES = 8;
const EXIT_FRAMES = 8;

export const CaptureBeat: React.FC<Props> = ({
  capturePath,
  durationFrames,
  clipStartSeconds = 0,
  chip,
  aspect,
  sting,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const portrait = aspect === "shorts";

  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: ENTER_FRAMES,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });
  const enterScale = interpolate(enterSpring, [0, 1], [1.05, 1]);
  const enterBlur = interpolate(enterSpring, [0, 1], [8, 0]);

  const exitProgress = interpolate(
    frame,
    [durationFrames - EXIT_FRAMES, durationFrames],
    [0, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const exitOpacity = 1 - exitProgress;
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.04]);
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 6]);

  const chipOpacity = interpolate(frame, [4, 12, 44, 56], [0, 1, 1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = enterSpring * exitOpacity;
  const scale = enterScale * exitScale;
  const blur = Math.max(enterBlur, exitBlur);

  // Portrait clips cropped to 9:16 — Remotion handles this via the
  // OffthreadVideo's object-fit. We render at full canvas and crop center.
  return (
    <AbsoluteFill style={{ backgroundColor: color.ink }}>
      <GrainGradientUnderlay opacity={0.06} speed={0.2} />

      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(capturePath)}
          startFrom={Math.round(clipStartSeconds * fps)}
          volume={0}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px ${color.brand}1a, inset 0 0 160px rgba(0,0,0,0.55)`,
          opacity,
        }}
      />

      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)",
          opacity,
        }}
      />

      {sting ? <GodRaysSting opacity={0.55} speed={0.9} intensity={0.6} /> : null}

      {chip ? (
        <div
          style={{
            position: "absolute",
            top: portrait ? 96 : 36,
            left: portrait ? 32 : 40,
            padding: portrait ? "8px 16px" : "8px 14px",
            borderRadius: 9999,
            backgroundColor: "rgba(10,10,15,0.78)",
            backdropFilter: "blur(12px) saturate(160%)",
            WebkitBackdropFilter: "blur(12px) saturate(160%)",
            border: `1px solid ${color.brand}55`,
            color: color.cream,
            fontFamily: fonts.mono,
            fontSize: portrait ? 13 : 12,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            opacity: chipOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 9999,
              backgroundColor: color.brand,
              boxShadow: `0 0 12px ${color.brand}`,
            }}
          />
          {chip}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
