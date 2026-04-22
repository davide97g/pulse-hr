import {
  Tv,
  Presentation,
  PhoneCall,
  Monitor,
  Fan,
  Users,
  Projector,
  Video,
  Wifi,
  Armchair,
  StretchHorizontal,
} from "lucide-react";
import type { Amenity, Room, Seat } from "@/lib/offices";
import { cn } from "@/lib/utils";

interface AmenityMeta {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export const AMENITY_META: Record<Amenity, AmenityMeta> = {
  tv: { icon: Tv, label: "TV screen" },
  whiteboard: { icon: Presentation, label: "Whiteboard" },
  speakerphone: { icon: PhoneCall, label: "Speakerphone" },
  monitor: { icon: Monitor, label: "External monitor" },
  ac: { icon: Fan, label: "Air conditioning" },
  "standing-desk": { icon: StretchHorizontal, label: "Standing desk" },
  videoconf: { icon: Video, label: "Video-conference kit" },
  projector: { icon: Projector, label: "Projector" },
};

interface AmenityIconsProps {
  amenities: Amenity[];
  size?: "xs" | "sm" | "md";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<AmenityIconsProps["size"]>, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

/** Row of amenity icons, each with a native tooltip via `title`. */
export function AmenityIcons({ amenities, size = "sm", className }: AmenityIconsProps) {
  if (amenities.length === 0) return null;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {amenities.map((a) => {
        const meta = AMENITY_META[a];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <span
            key={a}
            title={meta.label}
            aria-label={meta.label}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon className={SIZE_CLASS[size]} />
          </span>
        );
      })}
    </span>
  );
}

export function RoomAmenities({
  room,
  size = "sm",
  className,
}: {
  room: Room;
  size?: AmenityIconsProps["size"];
  className?: string;
}) {
  return <AmenityIcons amenities={room.amenities} size={size} className={className} />;
}

interface SeatFeaturesProps {
  seat: Seat;
  size?: AmenityIconsProps["size"];
  className?: string;
}

export function SeatFeatures({ seat, size = "sm", className }: SeatFeaturesProps) {
  const features: { icon: React.ComponentType<{ className?: string }>; label: string }[] = [];
  if (seat.wifi) features.push({ icon: Wifi, label: "Wi-Fi" });
  if (seat.monitor) features.push({ icon: Monitor, label: "External monitor" });
  if (seat.standing) features.push({ icon: StretchHorizontal, label: "Standing desk" });
  features.push({ icon: Armchair, label: `Zone ${seat.zone}` });
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <span
            key={i}
            title={f.label}
            aria-label={f.label}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon className={SIZE_CLASS[size]} />
          </span>
        );
      })}
    </span>
  );
}
