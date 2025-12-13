import { Metadata } from 'next';
import { applySeoOverride } from '@/lib/seo/overrides';

export async function generateMetadata(): Promise<Metadata> {
  const overridden = await applySeoOverride({
    title: 'أضف شركتك | توصية',
    description: 'أضف شركتك إلى دليل توصية واصل إلى آلاف العملاء المحتملين في العالم العربي'
  }, '/add-company', { targetType: 'CUSTOM_PATH', targetId: '/add-company' });

  return {
    title: overridden.title,
    description: overridden.description,
  };
}

export default function AddCompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
