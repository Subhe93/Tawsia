'use client';

import { useEffect, useState, useCallback } from 'react';
import { Award, Trophy, Medal, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';

interface Award {
  id: string;
  title: string;
  description?: string;
  year?: number;
  awardType: 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE';
  issuer?: string;
  imageUrl?: string;
}

interface CompanyAwardsProps {
  awards: Award[];
  companyName: string;
}

export function CompanyAwards({ awards, companyName }: CompanyAwardsProps) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Embla Carousel options
  const options: EmblaOptionsType = {
    align: 'start',
    loop: true,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    direction: 'rtl',
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-play functionality with Embla
  useEffect(() => {
    if (!emblaApi || !isAutoPlaying || awards.length <= 1) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [emblaApi, isAutoPlaying]);

  // Update selected index when slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const getAwardIcon = (type: Award['awardType']) => {
    switch (type) {
      case 'GOLD':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'SILVER':
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 'BRONZE':
        return <Award className="h-6 w-6 text-amber-600" />;
      case 'CERTIFICATE':
        return <Star className="h-6 w-6 text-blue-500" />;
      default:
        return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  const getAwardColor = (type: Award['awardType']) => {
    switch (type) {
      case 'GOLD':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-800';
      case 'SILVER':
        return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-700';
      case 'BRONZE':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800';
      case 'CERTIFICATE':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-700';
    }
  };

  const getTypeLabel = (type: Award['awardType']) => {
    switch (type) {
      case 'GOLD':
        return 'جائزة ذهبية';
      case 'SILVER':
        return 'جائزة فضية';
      case 'BRONZE':
        return 'جائزة برونزية';
      case 'CERTIFICATE':
        return 'شهادة';
      default:
        return 'جائزة';
    }
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (awards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الأوسمة والجوائز</h2>
        </div>
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">لا توجد جوائز مسجلة حالياً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الأوسمة والجوائز</h2>
        </div>
        {awards.length > 1 && (
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={toggleAutoPlay}
              className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
            >
              {isAutoPlaying ? 'إيقاف' : 'تشغيل'}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {awards.length} جائزة
            </span>
          </div>
        )}
      </div>

      {/* Embla Carousel */}
      <div className="relative">
        {/* Mobile: Show 1.25 slides, Desktop: Show 1 slide */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {awards.map((award, index) => (
              <div
                key={award.id}
                className="flex-[0_0_80%] md:flex-[0_0_100%] min-w-0 px-2 md:px-0"
              >
                <div className={`border rounded-xl p-4 md:p-6 transition-all duration-500 hover:shadow-lg ${getAwardColor(award.awardType)}`}>
                  {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
                  <div className="md:flex md:items-center px-2 md:space-x-6 md:space-x-reverse">
                    {/* Award Icon */}
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg border border-gray-200/50 mx-auto md:mx-0 mb-3 md:mb-0">
                      {getAwardIcon(award.awardType)}
                    </div>
                    
                    {/* Award Content */}
                    <div className="flex-1 text-center md:text-right">
                      <div className="md:flex md:items-start md:justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {award.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm md:text-base">
                            {award.issuer || 'منصة توصية'}
                          </p>
                          {award.description && (
                            <p className="hidden md:block text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                              {award.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Award Badge and Year */}
                        <div className="text-center md:flex-shrink-0 md:ml-6">
                          <Badge variant="outline" className="mb-2 text-xs md:text-sm px-2 py-1 md:px-3">
                            {getTypeLabel(award.awardType)}
                          </Badge>
                          <div className="flex items-center justify-center space-x-1 space-x-reverse text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="text-xs md:text-sm font-medium">{award.year || 'غير محدد'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Desktop Only */}
        {awards.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="hidden md:block absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={scrollNext}
              className="hidden md:block absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}
      </div>

      {/* Award Indicators */}
      {awards.length > 1 && (
        <div className="flex justify-center space-x-2 space-x-reverse mt-6">
          {awards.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-yellow-500 scale-125'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>الجائزة {selectedIndex + 1} من {awards.length}</span>
        <span>حصلت عليها في عام {awards[selectedIndex]?.year || 'غير محدد'}</span>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
          <Trophy className="h-4 w-4 ml-2" />
          جميع الجوائز والشهادات ممنوحة من منصة توصية تقديراً لالتزام {companyName} بالجودة والتميز
        </p>
      </div>
    </div>
  );
}