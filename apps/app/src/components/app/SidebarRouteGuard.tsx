import { useUser } from "@clerk/react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { useEffectiveRole, useIsEffectiveAdmin } from "@/lib/role-override";
import { featuresForRole } from "@/lib/role-features";
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
  const { isLoaded } = useUser();
  const { enabled, roleFeatures } = useSidebarFeatures();
  const admin = useIsEffectiveAdmin();
  const role = useEffectiveRole();
  const roleAllowed = featuresForRole(role, roleFeatures);

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
    const blockedByRole = fid ? !roleAllowed.has(fid) : false;
    const blockedByWorkspace = fid ? enabled[fid] === false : false;
    if (fid && (blockedByRole || blockedByWorkspace)) {
      const dest = firstEnabledAppPath(enabled);
      const destFid = pathToSidebarFeatureId(dest);
      const destOk =
        !destFid || (roleAllowed.has(destFid) && enabled[destFid] !== false);
      return <Navigate to={destOk ? dest : "/profile"} replace />;
    }
  }

  return <>{children}</>;
}
