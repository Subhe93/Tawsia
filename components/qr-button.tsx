'use client';

import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyQRModal } from './company-qr-modal';

interface QRButtonProps {
  companyName: string;
  companySlug: string;
  variant?: 'desktop' | 'mobile';
}

export function QRButton({ companyName, companySlug, variant = 'desktop' }: QRButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === 'mobile') {
    return (
      <>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="w-full py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300"
        >
          <QrCode className="h-5 w-5 ml-2" />
          رمز QR للتقييمات
        </Button>

        <CompanyQRModal
          companyName={companyName}
          companySlug={companySlug}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="lg"
        className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/40 hover:border-white/60 shadow-lg transition-all duration-300 px-6 py-3"
      >
        <QrCode className="h-5 w-5 ml-2" />
        رمز QR
      </Button>

      <CompanyQRModal
        companyName={companyName}
        companySlug={companySlug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

