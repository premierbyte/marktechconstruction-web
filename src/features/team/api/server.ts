import { getContentPage, type ContentPage } from "@/features/content";

export async function getTeamPage(): Promise<ContentPage | null> {
  return getContentPage("team");
}
