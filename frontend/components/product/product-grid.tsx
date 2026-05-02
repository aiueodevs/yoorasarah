import type { ReactNode } from "react";
import type { Product } from "../../lib/api";
import { ProductCard } from "./product-card";

export function ProductGrid({
  priorityCount = 4,
  products,
  renderAction
}: {
  priorityCount?: number;
  products: Product[];
  renderAction?: (product: Product) => ReactNode;
}) {
  return (
    <section className="mx-auto grid w-full max-w-[1280px] auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          action={renderAction?.(product)}
          priority={index < priorityCount}
          product={product}
        />
      ))}
    </section>
  );
}
