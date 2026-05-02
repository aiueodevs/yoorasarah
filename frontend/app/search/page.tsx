import { SearchPage } from "../../components/pages/search/search-page";
import { ApiErrorState } from "../../components/shared/api-error-state";
import { getCategories, searchProducts, type ProductSearchSort } from "../../lib/api";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function searchSort(value: string | undefined): ProductSearchSort {
  return value === "price-asc" || value === "price-desc" || value === "best-seller" ? value : "newest";
}

export default async function SearchRoutePage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  try {
    const params = await searchParams;
    const [result, categories] = await Promise.all([
      searchProducts({
        q: firstParam(params?.q),
        categorySlug: firstParam(params?.categorySlug),
        sort: searchSort(firstParam(params?.sort)),
        page: Number(firstParam(params?.page) ?? 1),
        limit: 24
      }),
      getCategories()
    ]);
    return <SearchPage categories={categories} result={result} />;
  } catch (error) {
    return <ApiErrorState message={error instanceof Error ? error.message : undefined} />;
  }
}
