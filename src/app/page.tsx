import { cookies } from "next/headers";
import { HomeHeroSlider } from "@/components/HomeHeroSlider";
import { getHeroSlides } from "@/lib/data";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);
  const slides = await getHeroSlides();

  return <HomeHeroSlider lang={lang} slides={slides} />;
}
