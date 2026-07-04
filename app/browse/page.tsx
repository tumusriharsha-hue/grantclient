import { BrowseGrantsPage } from "@/components/browse/browse-grants-page";
import { getAllGrants } from "@/lib/grants/queries";

export default async function BrowsePage() {
  const grants = await getAllGrants();

  return <BrowseGrantsPage grants={grants} />;
}
