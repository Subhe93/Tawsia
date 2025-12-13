"use client";

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { toast } from '@/hooks/use-toast';

interface ShareButtonProps {
  companyName: string;
  companyDescription: string;
}

export function ShareButton({ companyName, companyDescription }: ShareButtonProps) {
  const handleShareClick = async () => {
    const shareData = {
      title: companyName,
      text: companyDescription,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // toast({
        //   title: "تم نسخ الرابط",
        //   description: "تم نسخ رابط الصفحة إلى الحافظة.",
        // });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // toast({
      //   title: "خطأ",
      //   description: "لم نتمكن من مشاركة الصفحة.",
      //   variant: "destructive",
      // });
    }
  };

  return (
    <Button 
      variant="outline" 
      size="lg"
      onClick={handleShareClick}
      className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/40 hover:border-white/60 shadow-lg transition-all duration-300 px-6 py-3"
    >
      <Share2 className="h-5 w-5 ml-2" />
      مشاركة
    </Button>
  );
}
