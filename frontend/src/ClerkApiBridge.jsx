
import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setClerkTokenGetter } from "./utils/api";

export default function ClerkApiBridge() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setClerkTokenGetter(null);
      return;
    }

    const clerkTokenGetter = async () => {
      return await getToken();
    };

    setClerkTokenGetter(clerkTokenGetter);

    return () => {
      setClerkTokenGetter(null);
    };
  }, [isLoaded, isSignedIn, getToken]);

  return null;
}
