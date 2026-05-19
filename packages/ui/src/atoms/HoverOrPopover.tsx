import * as React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../primitives/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../primitives/popover";
import { useIsMobile } from "../hooks/use-mobile";

const Ctx = React.createContext<{ isMobile: boolean }>({ isMobile: false });

type RootProps = {
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: React.ReactNode;
};

function Root({ openDelay, closeDelay, modal, ...rest }: RootProps) {
  const isMobile = useIsMobile();
  return (
    <Ctx.Provider value={{ isMobile }}>
      {isMobile ? (
        <Popover modal={modal} {...rest} />
      ) : (
        <HoverCard openDelay={openDelay} closeDelay={closeDelay} {...rest} />
      )}
    </Ctx.Provider>
  );
}

type TriggerProps = React.ComponentProps<typeof HoverCardTrigger> &
  React.ComponentProps<typeof PopoverTrigger>;

function Trigger(props: TriggerProps) {
  const { isMobile } = React.useContext(Ctx);
  return isMobile ? <PopoverTrigger {...props} /> : <HoverCardTrigger {...props} />;
}

type ContentProps = React.ComponentProps<typeof HoverCardContent> &
  React.ComponentProps<typeof PopoverContent>;

const Content = React.forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
  const { isMobile } = React.useContext(Ctx);
  return isMobile ? (
    <PopoverContent ref={ref} {...props} />
  ) : (
    <HoverCardContent ref={ref} {...props} />
  );
});
Content.displayName = "HoverOrPopoverContent";

export {
  Root as HoverOrPopover,
  Trigger as HoverOrPopoverTrigger,
  Content as HoverOrPopoverContent,
};
