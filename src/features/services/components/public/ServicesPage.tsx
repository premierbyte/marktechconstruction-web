import { getServices } from "../../api/server";
import { ServicesCta } from "./ServicesCta";
import { ServicesGrid } from "./ServicesGrid";
import { ServicesIntro } from "./ServicesIntro";

export async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <ServicesIntro />
      <ServicesGrid services={services} />
      <ServicesCta />
    </>
  );
}
