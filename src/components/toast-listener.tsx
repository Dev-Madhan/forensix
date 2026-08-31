"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

function ToastListenerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = searchParams.get("toast");
    const err = searchParams.get("error");

    if (t || err) {
      if (t === "google") toast.success("Signed in with Google", { id: "oauth-toast" });
      if (t === "github") toast.success("Signed in with GitHub", { id: "oauth-toast" });
      if (err) toast.error("Authentication failed. Please try again.", { id: "oauth-toast" });

      // Clean up the URL by removing the toast parameters without refreshing the page
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("toast");
      newSearchParams.delete("error");
      
      const newUrl = pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "");
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}

export function ToastListener() {
  return (
    <Suspense fallback={null}>
      <ToastListenerInner />
    </Suspense>
  );
}
