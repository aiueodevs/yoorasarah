"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  addCartItem as apiAddCartItem,
  addWishlistItem as apiAddWishlistItem,
  clearCart as apiClearCart,
  getCart,
  getWishlist,
  removeCartItem as apiRemoveCartItem,
  removeWishlistItem as apiRemoveWishlistItem,
  updateCartItem as apiUpdateCartItem,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  type CartItemUpdateInput,
  type ApiWishlistItem
} from "../../lib/api";
import { initialCart, type CartItem, type ChatMessage } from "../../lib/storefront";

type AsyncStatus = "idle" | "loading" | "ready" | "error";

type StoreContextValue = {
  cart: CartItem[];
  cartCount: number;
  cartStatus: AsyncStatus;
  wishlistItems: ApiWishlistItem[];
  wishlistProductIds: string[];
  wishlistStatus: AsyncStatus;
  storeError: string | null;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addCartItem: (input: { productId: string; colorVariantId?: string; colorName: string; size: string; quantity: number }) => Promise<void>;
  updateCartItem: (id: string, input: CartItemUpdateInput) => Promise<void>;
  updateCartItemQuantity: (id: string, quantity: number) => Promise<void>;
  removeCartItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addWishlistItem: (productId: string) => Promise<void>;
  removeWishlistItem: (productId: string) => Promise<void>;
  toggleWishlistItem: (productId: string) => Promise<boolean>;
  notice: string | null;
  showNotice: (message: string) => void;
  assistantMessages: ChatMessage[];
  addAssistantMessage: (message: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [cartStatus, setCartStatus] = useState<AsyncStatus>("idle");
  const [wishlistItems, setWishlistItems] = useState<ApiWishlistItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<AsyncStatus>("idle");
  const [storeError, setStoreError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Halo! Saya asisten Yoora Sarah. Saya bisa membantu menemukan produk, cek ketersediaan, lacak pesanan, atau jawab pertanyaan tentang kebijakan toko."
    }
  ]);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const errorMessage = useCallback((error: unknown) => error instanceof Error ? error.message : "Backend API belum bisa dijangkau.", []);

  const applyCart = useCallback((nextCart: { items: CartItem[] }) => {
    setCart(nextCart.items);
    setCartStatus("ready");
  }, []);

  const applyWishlist = useCallback((nextWishlist: { items: ApiWishlistItem[]; productIds: string[] }) => {
    setWishlistItems(nextWishlist.items);
    setWishlistProductIds(nextWishlist.productIds);
    setWishlistStatus("ready");
  }, []);

  const refreshCart = useCallback(async () => {
    setCartStatus("loading");
    try {
      applyCart(await getCart());
      setStoreError(null);
    } catch (error) {
      setCart([]);
      setCartStatus("error");
      setStoreError(errorMessage(error));
    }
  }, [applyCart, errorMessage]);

  const refreshWishlist = useCallback(async () => {
    setWishlistStatus("loading");
    try {
      applyWishlist(await getWishlist());
      setStoreError(null);
    } catch (error) {
      setWishlistItems([]);
      setWishlistProductIds([]);
      setWishlistStatus("error");
      setStoreError(errorMessage(error));
    }
  }, [applyWishlist, errorMessage]);

  useEffect(() => {
    void refreshCart();
    void refreshWishlist();
  }, [refreshCart, refreshWishlist]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2300);
  }, []);

  const addAssistantMessage = useCallback((text: string) => {
    setAssistantMessages((messages) => [
      ...messages,
      { role: "user", text },
      {
        role: "assistant",
        text: "Saya bantu ya. Untuk pilihan aman, mulai dari Dress atau Abaya warna netral, lalu cek ukuran dan stok pada detail produk."
      }
    ]);
  }, []);

  const addCartItem = useCallback(async (input: { productId: string; colorVariantId?: string; colorName: string; size: string; quantity: number }) => {
    try {
      applyCart(await apiAddCartItem(input));
      setStoreError(null);
    } catch (error) {
      const message = errorMessage(error);
      setStoreError(message);
      showNotice(message);
      throw error;
    }
  }, [applyCart, errorMessage, showNotice]);

  const updateCartItem = useCallback(async (id: string, input: CartItemUpdateInput) => {
    try {
      applyCart(await apiUpdateCartItem(id, input));
      setStoreError(null);
    } catch (error) {
      const message = errorMessage(error);
      setStoreError(message);
      showNotice(message);
    }
  }, [applyCart, errorMessage, showNotice]);

  const updateCartItemQuantity = useCallback(async (id: string, quantity: number) => {
    try {
      applyCart(await apiUpdateCartItemQuantity(id, quantity));
      setStoreError(null);
    } catch (error) {
      const message = errorMessage(error);
      setStoreError(message);
      showNotice(message);
    }
  }, [applyCart, errorMessage, showNotice]);

  const removeCartItem = useCallback(async (id: string) => {
    try {
      applyCart(await apiRemoveCartItem(id));
      setStoreError(null);
      showNotice("Produk dihapus dari keranjang.");
    } catch (error) {
      const message = errorMessage(error);
      setStoreError(message);
      showNotice(message);
    }
  }, [applyCart, errorMessage, showNotice]);

  const clearCart = useCallback(async () => {
    try {
      applyCart(await apiClearCart());
      setStoreError(null);
      showNotice("Keranjang dikosongkan.");
    } catch (error) {
      const message = errorMessage(error);
      setStoreError(message);
      showNotice(message);
    }
  }, [applyCart, errorMessage, showNotice]);

  const addWishlistItem = useCallback(async (productId: string) => {
    try {
      applyWishlist(await apiAddWishlistItem(productId));
      setStoreError(null);
    } catch (error) {
      const message = errorMessage(error);
      setStoreError(message);
      showNotice(message);
      throw error;
    }
  }, [applyWishlist, errorMessage, showNotice]);

  const removeWishlistItem = useCallback(async (productId: string) => {
    try {
      applyWishlist(await apiRemoveWishlistItem(productId));
      setStoreError(null);
    } catch (error) {
      const message = errorMessage(error);
      setStoreError(message);
      showNotice(message);
      throw error;
    }
  }, [applyWishlist, errorMessage, showNotice]);

  const toggleWishlistItem = useCallback(async (productId: string) => {
    if (wishlistProductIds.includes(productId)) {
      await removeWishlistItem(productId);
      return false;
    }
    await addWishlistItem(productId);
    return true;
  }, [addWishlistItem, removeWishlistItem, wishlistProductIds]);

  const value = useMemo<StoreContextValue>(() => ({
    cart,
    cartCount: cart.reduce((total, item) => total + item.qty, 0),
    cartStatus,
    wishlistItems,
    wishlistProductIds,
    wishlistStatus,
    storeError,
    refreshCart,
    refreshWishlist,
    addCartItem,
    updateCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    addWishlistItem,
    removeWishlistItem,
    toggleWishlistItem,
    notice,
    showNotice,
    assistantMessages,
    addAssistantMessage
  }), [
    addAssistantMessage,
    addCartItem,
    addWishlistItem,
    assistantMessages,
    cart,
    cartStatus,
    clearCart,
    notice,
    refreshCart,
    refreshWishlist,
    removeCartItem,
    removeWishlistItem,
    showNotice,
    storeError,
    toggleWishlistItem,
    updateCartItem,
    updateCartItemQuantity,
    wishlistItems,
    wishlistProductIds,
    wishlistStatus
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
