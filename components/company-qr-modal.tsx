'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Download, Share2, Check, QrCode, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyQRModalProps {
  companyName: string;
  companySlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyQRModal({ companyName, companySlug, isOpen, onClose }: CompanyQRModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  
  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://twsia.com';
  const reviewUrl = `${baseUrl}/${companySlug}/add-review`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل نسخ الرابط:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (higher resolution)
    const size = 1024;
    canvas.width = size;
    canvas.height = size + 200; // Extra space for text

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Draw QR code centered
      const qrSize = 800;
      const x = (size - qrSize) / 2;
      const y = 80;
      ctx.drawImage(img, x, y, qrSize, qrSize);

      // Add company name at bottom
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(companyName, size / 2, size + 120);

      // Add "Scan to Review" text
      ctx.font = '32px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('امسح للتقييم', size / 2, size + 170);

      // Download
      const link = document.createElement('a');
      link.download = `qr-${companySlug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `قيّم ${companyName}`,
          text: `شاركنا رأيك في ${companyName}`,
          url: reviewUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('فشل المشاركة:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">رمز QR للتقييمات</h2>
                <p className="text-white/80 text-sm mt-1">{companyName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-8">
          <div 
            ref={qrRef}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 mx-auto w-fit"
          >
            <QRCodeSVG
              value={reviewUrl}
              size={220}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#1f2937"
            />
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm">امسح الرمز لإضافة تقييمك</span>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              اطبع هذا الرمز وضعه في مكانك لتسهيل التقييم على عملائك
            </p>
          </div>

          {/* URL Display */}
          {/* <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">رابط التقييم:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center break-all font-mono">
              {reviewUrl}
            </p>
          </div> */}

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1 py-4 h-auto rounded-xl border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-blue-600" />
              )}
              <span className="text-xs">{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadQR}
              className="flex flex-col items-center gap-1 py-4 h-auto rounded-xl border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
            >
              <Download className="h-5 w-5 text-green-600" />
              <span className="text-xs">تحميل QR</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex flex-col items-center gap-1 py-4 h-auto rounded-xl border-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            >
              <Share2 className="h-5 w-5 text-purple-600" />
              <span className="text-xs">مشاركة</span>
            </Button>
          </div>
        </div>

        {/* Footer Tip */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 border-t border-amber-100 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-800 rounded-lg p-2 flex-shrink-0">
              <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                نصيحة للحصول على تقييمات أكثر
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                ضع رمز QR على الطاولات، الفواتير، أو عند المدخل ليتمكن العملاء من التقييم بسهولة
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

