import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";
import { tokenizeBrandText } from "../components/text";

export interface FinaleClip {
  capturePath: string;
  /** Start offset into the source clip (frames). */
  startFrame?: number;
  /** Slight Ken-Burns push for this snippet. */
  scaleFrom?: number;
  scaleTo?: number;
  translateX?: number;
  translateY?: number;
}

export interface FinaleMontageProps {
  /** Ordered list of intercut snippets. */
  clips: FinaleClip[];
  /** Frames per snippet (default 12 = 0.4s @ 30fps). */
  perClipFrames?: number;
  /** Cross-dissolve overlap between snippets (default 3). */
  crossfadeFrames?: number;
  /** Big finale tagline rendered on top (game-trailer voice). */
  tagline?: string;
  /** Frame at which the tagline springs in. */
  taglineFrame?: number;
}

export const FinaleMontage: React.FC<FinaleMontageProps> = ({
  clips,
  perClipFrames = 12,
  crossfadeFrames = 3,
  tagline = "HR · *rebuilt*.",
  taglineFrame = 130,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Total runtime = clip slots overlapped by crossfade.
  const stride = perClipFrames - crossfadeFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020205" }}>
      {clips.map((clip, i) => {
        const start = i * stride;
        return (
          <Sequence
            key={i}
            from={start}
            durationInFrames={perClipFrames + crossfadeFrames}
          >
            <FinaleSnippet
              clip={clip}
              durationFrames={perClipFrames + crossfadeFrames}
              crossfadeFrames={crossfadeFrames}
            />
          </Sequence>
        );
      })}

      {/* Heavy vignette over the whole finale */}
      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px ${color.brand}26, inset 0 0 220px rgba(0,0,0,0.7)`,
          background: `radial-gradient(ellipse 88% 72% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)`,
        }}
      />

      {/* Tagline reveal — big, hard-cut feel */}
      <TaglineFlash
        text={tagline}
        frame={frame}
        fps={fps}
        startFrame={taglineFrame}
      />
    </AbsoluteFill>
  );
};

const FinaleSnippet: React.FC<{
  clip: FinaleClip;
  durationFrames: number;
  crossfadeFrames: number;
}> = ({ clip, durationFrames, crossfadeFrames }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, crossfadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationFrames - crossfadeFrames, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Light directional motion blur — fakes via translate-blur in/out.
  const blur =
    interpolate(fadeIn, [0, 1], [6, 0]) +
    interpolate(fadeOut, [0, 1], [6, 0]);

  const t = interpolate(frame, [0, durationFrames], [0, 1], {
    easing: Easing.linear,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(
    t,
    [0, 1],
    [clip.scaleFrom ?? 1.08, clip.scaleTo ?? 1.18],
  );
  const tx = clip.translateX ?? 0;
  const ty = clip.translateY ?? 0;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    >
      <OffthreadVideo
        src={staticFile(clip.capturePath)}
        startFrom={clip.startFrame ?? 0}
      />
    </AbsoluteFill>
  );
};

const TaglineFlash: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startFrame: number;
}> = ({ text, frame, fps, startFrame }) => {
  const tokens = tokenizeBrandText(text);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.4em",
          fontFamily: fonts.display,
          fontSize: 132,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "#ffffff",
          textShadow:
            "0 24px 80px rgba(0,0,0,0.85), 0 0 60px rgba(155,135,255,0.18)",
        }}
      >
        {tokens.map((tok, i) => {
          const start = startFrame + i * 8;
          const sp = spring({
            frame: frame - start,
            fps,
            config: { damping: 14, mass: 0.8, stiffness: 150 },
          });
          const lift = interpolate(sp, [0, 1], [40, 0]);
          const blur = interpolate(sp, [0, 1], [12, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: sp,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
                color: tok.brand ? color.brand : "#ffffff",
                fontStyle: tok.brand ? "italic" : "normal",
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
