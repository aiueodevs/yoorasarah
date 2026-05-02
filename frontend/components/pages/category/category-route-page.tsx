import { getAllProductsRoute, getCategoryRoute, getCollectionRoute } from "../../../lib/api";
import { ApiErrorState } from "../../shared/api-error-state";
import { CategoryPage } from "./category-page";

type CategoryRoutePageProps =
  | { type: "all" }
  | { type: "category"; slug: string }
  | { type: "collection"; collection: "new-arrival" | "best-seller" };

export async function CategoryRoutePage(props: CategoryRoutePageProps) {
  try {
    const route =
      props.type === "all"
        ? await getAllProductsRoute()
        : props.type === "category"
          ? await getCategoryRoute(props.slug)
          : await getCollectionRoute(props.collection);

    return <CategoryPage route={route} />;
  } catch (error) {
    return <ApiErrorState message={error instanceof Error ? error.message : undefined} />;
  }
}
