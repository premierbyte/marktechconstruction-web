import { Suspense } from "react";
import { Container, Section } from "@/components/layout/Section";
import {
  parseGalleryFilters,
  type SearchParamsRecord,
} from "../../utils/pagination";
import { GalleryIntro } from "./GalleryIntro";
import { GalleryResults } from "./GalleryResults";
import { GallerySkeleton } from "./GallerySkeleton";

export function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParamsRecord;
}) {
  const filters = parseGalleryFilters(searchParams);

  return (
    <>
      <GalleryIntro />
      <Section>
        <Container>
          <Suspense
            key={JSON.stringify(filters)}
            fallback={<GallerySkeleton />}
          >
            <GalleryResults filters={filters} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}