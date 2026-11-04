import { getSectors } from "../../api/server";
import { SectorsCta } from "./SectorsCta";
import { SectorsGrid } from "./SectorsGrid";
import { SectorsIntro } from "./SectorsIntro";

export async function SectorsPage() {
  const sectors = await getSectors();

  return (
    <>
      <SectorsIntro />
      <SectorsGrid sectors={sectors} />
      <SectorsCta />
    </>
  );
}
