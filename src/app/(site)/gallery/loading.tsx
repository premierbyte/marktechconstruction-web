import { Container, Section } from "@/components/layout/Section";
import { GallerySkeleton } from "@/features/gallery";

export default function GalleryLoading() {
  return (
    <Section>
      <Container>
        <GallerySkeleton />
      </Container>
    </Section>
  );
}
