import { LatestPage } from "../../components/pages/latest/latest-page";
import { ApiErrorState } from "../../components/shared/api-error-state";
import { getNewArrivalProducts } from "../../lib/api";

export default async function TerbaruPage() {
  try {
    const products = await getNewArrivalProducts();
    return <LatestPage products={products} />;
  } catch (error) {
    return <ApiErrorState message={error instanceof Error ? error.message : undefined} />;
  }
}
