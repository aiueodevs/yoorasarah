"use client";

import { useEffect, useState } from "react";
import { getAdminProduct, type AdminProduct } from "../lib/api";
import { ProductForm } from "./product-form";

export function EditProductLoader({ id }: { id: string }) {
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminProduct(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Produk tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="rounded-lg border border-line bg-white p-5 text-sm text-clay/70">Mengambil detail produk...</p>;
  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</p>;
  if (!product) return null;

  return <ProductForm product={product} />;
}
