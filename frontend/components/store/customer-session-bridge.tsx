"use client";

import { useEffect, useRef } from "react";
import { attachCustomerSession } from "../../lib/api";
import { useSession } from "../../lib/auth-client";
import { useStore } from "./store-provider";

export function CustomerSessionBridge() {
  const { data: session } = useSession();
  const { refreshCart, refreshWishlist } = useStore();
  const attachedUserId = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || attachedUserId.current === userId) return;

    attachedUserId.current = userId;
    void attachCustomerSession()
      .then(async () => {
        await Promise.all([refreshCart(), refreshWishlist()]);
      })
      .catch(() => {
        attachedUserId.current = null;
      });
  }, [refreshCart, refreshWishlist, session?.user?.id]);

  return null;
}
