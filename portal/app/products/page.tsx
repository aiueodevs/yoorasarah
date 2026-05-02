import { PortalShell } from "../../components/portal-shell";
import { ProductsDashboard } from "../../components/products-dashboard";

export default function ProductsPage() {
  return (
    <PortalShell>
      <ProductsDashboard />
    </PortalShell>
  );
}
