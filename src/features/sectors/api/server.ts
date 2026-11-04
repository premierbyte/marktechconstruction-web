import { getCapabilities, type Capability } from "@/features/capabilities";

export async function getSectors(): Promise<Capability[]> {
  return getCapabilities("sector");
}
