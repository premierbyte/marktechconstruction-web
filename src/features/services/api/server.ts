import { getCapabilities, type Capability } from "@/features/capabilities";

export async function getServices(): Promise<Capability[]> {
  return getCapabilities("service");
}
