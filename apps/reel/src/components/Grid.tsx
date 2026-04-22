import { AbsoluteFill } from "remotion";

export const Grid: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.12,
        backgroundImage:
          "linear-gradient(to right, #ffffff22 1px, transparent 1px), linear-gradient(to bottom, #ffffff22 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black 40%, transparent 100%)",
      }}
    />
  );
};
