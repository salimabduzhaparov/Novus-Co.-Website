import { permanentRedirect } from "next/navigation";

// Retired portfolio links lead to current service information.
export default function WorkPage() {
  permanentRedirect("/services");
}
