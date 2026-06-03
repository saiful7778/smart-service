import { getAuthUserWithRolesAndPermissionsWithContextCache } from "@/features/auth/data/getAuthUser";
import { AuthStoreProvider } from "@/stores/zustand/auth/AuthStoreContext";

export default async function PrivateLayout({ children }: LayoutProps<"/">) {
  const { session, permissions, roles, user } =
    await getAuthUserWithRolesAndPermissionsWithContextCache();

  return (
    <AuthStoreProvider
      user={user}
      session={session}
      permissions={permissions}
      roles={roles}
    >
      {children}
    </AuthStoreProvider>
  );
}
