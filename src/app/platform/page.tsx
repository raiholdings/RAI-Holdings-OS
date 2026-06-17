import { allPlatforms } from "@/lib/platform";
import { PlatformCatalog } from "@/components/platform/PlatformCatalog";

export default function Platform() {
  return <PlatformCatalog seed={allPlatforms()} />;
}
