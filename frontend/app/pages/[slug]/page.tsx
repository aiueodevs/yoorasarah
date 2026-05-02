import { notFound } from "next/navigation";
import { InfoPage, infoPages } from "../../../components/pages/info/info-page";

type InfoRouteProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function InfoRoutePage({ params }: InfoRouteProps) {
  const { slug } = await params;
  const page = infoPages[slug];

  if (!page) {
    notFound();
  }

  return <InfoPage page={page} />;
}
