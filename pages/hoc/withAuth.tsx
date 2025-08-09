// pages/hoc/withAuth.tsx
import React from "react";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";

type WithAuthOptions = {
  redirectTo?: string; // where to send unauthenticated users
  showWhileLoading?: React.ReactNode; // optional custom loader
};

function withAuth<P extends React.JSX.IntrinsicAttributes>(
  Wrapped: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = "/login", showWhileLoading } = options;

  const Authed: React.FC<P> = (props) => {
    const router = useRouter();
    const [user, setUser] = React.useState<User | null | undefined>(undefined); // undefined = checking

    React.useEffect(() => {
      const auth = getAuth(app);
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (!u) {
          // not logged in -> go to login (avoid redirect loop)
          if (router.pathname !== redirectTo) {
            router.replace(redirectTo);
          }
        }
      });
      return () => unsub();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (user === undefined) {
      // still checking auth
      return (
        <>
          {showWhileLoading ?? (
            <div className="flex h-[60vh] items-center justify-center text-sm text-gray-600">
              Checking your session…
            </div>
          )}
        </>
      );
    }

    if (!user) {
      // we already kicked off a redirect; render nothing
      return null;
    }

    // authenticated -> render the wrapped page
    return <Wrapped {...props} />;
  };

  Authed.displayName = `withAuth(${Wrapped.displayName || Wrapped.name || "Component"})`;

  return Authed;
}

export default withAuth;