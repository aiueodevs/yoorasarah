import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../components/pages/product-detail/product-detail-page";
import { ApiErrorState } from "../../../components/shared/api-error-state";
import { getProduct } from "../../../lib/api";

type ProductRouteProps = {
  params: Promise<{ category: string; slug: string }> | { category: string; slug: string };
};

export default async function ProductRoutePage({ params }: ProductRouteProps) {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);
    return <ProductDetailPage product={product} />;
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound();
    }

    return <ApiErrorState message={error instanceof Error ? error.message : undefined} />;
  }
}
