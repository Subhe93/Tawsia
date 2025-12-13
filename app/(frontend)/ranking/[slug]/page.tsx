import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getRankingPageBySlug,
  incrementRankingPageViews,
} from "@/lib/database/ranking-queries";
import RankingPageContent from "./RankingPageContent";
import { applySeoOverride } from "@/lib/seo/overrides";

// توليد metadata ديناميكي للصفحة
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const rankingPage = await getRankingPageBySlug(params.slug);

  if (!rankingPage) {
    return {
      title: "الصفحة غير موجودة",
    };
  }

  const overridden = await applySeoOverride({
    title: rankingPage.metaTitle || rankingPage.title,
    description: rankingPage.metaDescription || rankingPage.description,
  }, `/ranking/${params.slug}`, { targetType: 'RANKING_PAGE', targetId: rankingPage.id })

  return {
    title: overridden.title,
    description: overridden.description,
    keywords: rankingPage.metaKeywords.join(", "),
    openGraph: {
      title: rankingPage.metaTitle || rankingPage.title,
      description: rankingPage.metaDescription || rankingPage.description,
      type: "website",
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: rankingPage.metaTitle || rankingPage.title,
      description: rankingPage.metaDescription || rankingPage.description,
    },
    alternates: {
      canonical: `/ranking/${params.slug}`,
    },
  };
}

export default async function RankingPage({
  params,
}: {
  params: { slug: string };
}) {
  const rankingPage = await getRankingPageBySlug(params.slug);

  if (!rankingPage || !rankingPage.isActive) {
    notFound();
  }

  // تحديث عداد المشاهدات (في الخلفية)
  incrementRankingPageViews(rankingPage.id).catch(console.error);

  return <RankingPageContent rankingPage={rankingPage} />;
}
