import { useUser } from "@clerk/react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { isAdminUser } from "@/lib/comments/admin";
import {
  ADMIN_SIDEBAR_VISIBILITY_PATH,
  firstEnabledAppPath,
  pathToSidebarFeatureId,
} from "@/lib/sidebar-features";
import { useSidebarFeatures } from "@/components/app/SidebarFeaturesContext";

/**
 * Blocks navigation to disabled sidebar modules (non-admins) and protects the
 * admin visibility screen.
 */
export function SidebarRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, isLoaded } = useUser();
  const { enabled } = useSidebarFeatures();
  const admin = isAdminUser(user);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[40vh]">
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
      </div>
    );
  }

  const onAdminPage =
    pathname === ADMIN_SIDEBAR_VISIBILITY_PATH ||
    pathname.startsWith(`${ADMIN_SIDEBAR_VISIBILITY_PATH}/`);
  if (onAdminPage && !admin) {
    return <Navigate to="/" replace />;
  }

  if (!admin) {
    const fid = pathToSidebarFeatureId(pathname);
    if (fid && enabled[fid] === false) {
      const dest = firstEnabledAppPath(enabled);
      const destFid = pathToSidebarFeatureId(dest);
      const destOk = !destFid || enabled[destFid] !== false;
      return <Navigate to={destOk ? dest : "/profile"} replace />;
    }
  }

  return <>{children}</>;
}
