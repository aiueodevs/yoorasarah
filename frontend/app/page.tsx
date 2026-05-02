import { EditorialHome } from "../components/pages/home/editorial-home";
import { ApiErrorState } from "../components/shared/api-error-state";
import { getProducts } from "../lib/api";

export default async function HomePage() {
  try {
    const products = await getProducts();
    return <EditorialHome products={products} />;
  } catch (error) {
    return <ApiErrorState message={error instanceof Error ? error.message : undefined} />;
  }
}
