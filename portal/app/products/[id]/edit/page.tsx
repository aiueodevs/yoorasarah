import { EditProductLoader } from "../../../../components/edit-product-loader";
import { PortalShell } from "../../../../components/portal-shell";

type EditProductPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return (
    <PortalShell>
      <EditProductLoader id={id} />
    </PortalShell>
  );
}
