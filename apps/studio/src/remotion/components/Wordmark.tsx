import { color } from "../tokens";
import { fonts } from "../fonts";

export const Wordmark: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: fonts.mono,
        fontSize: 14,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 9999,
          backgroundColor: color.brand,
          boxShadow: `0 0 16px ${color.brand}`,
        }}
      />
      Pulse HR · open-source
    </div>
  );
};
