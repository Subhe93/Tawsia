'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Play, Pause, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';

interface CompanyGalleryProps {
  images?: string[];
}

// Default professional images for company gallery
const defaultImages = [
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3182750/pexels-photo-3182750.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=800'
];

export function CompanyGallery({ images = defaultImages }: CompanyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const galleryImages = images.length > 0 ? images : defaultImages;

  // Embla Carousel options
  const options: EmblaOptionsType = {
    align: 'start',
    loop: true,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    direction: 'rtl', // Enable RTL support
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-play functionality with Embla
  useEffect(() => {
    if (!emblaApi || !isPlaying || galleryImages.length <= 1) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [emblaApi, isPlaying, galleryImages.length]);

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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle keyboard navigation in modal
  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setSelectedImage(null);
          break;
        case 'ArrowLeft':
          if (selectedImage > 0) {
            setSelectedImage(selectedImage - 1);
          }
          break;
        case 'ArrowRight':
          if (selectedImage < galleryImages.length - 1) {
            setSelectedImage(selectedImage + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, galleryImages.length]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">معرض الصور</p>
        <div className="flex items-center space-x-2 space-x-reverse">
          {galleryImages.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              className="flex items-center space-x-1 space-x-reverse"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="text-xs">{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
            </Button>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {galleryImages.length} صورة
          </span>
        </div>
      </div>
      
      {/* Embla Carousel */}
      <div className="relative">
        {/* Mobile: Show 1.25 images, Desktop: Show 5 images */}
        <div className="overflow-hidden bg-gray-50 dark:bg-gray-700 rounded-2xl p-4" ref={emblaRef}>
          <div className="flex gap-3">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="flex-[0_0_80%] md:flex-[0_0_calc(20%-0.6rem)] min-w-0"
              >
                <div
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-200 dark:bg-gray-600 transform transition-all duration-300 hover:scale-105"
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`صورة ${index + 1}`}
                    fill
                    className="object-cover transition-all duration-300"
                    sizes="(max-width: 768px) 80vw, 20vw"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Image number */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Desktop Only */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={scrollNext}
              className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={scrollPrev}
              className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}
      </div>

      {/* Gallery Indicators */}
      {galleryImages.length > 1 && (
        <div className="flex justify-center space-x-2 space-x-reverse mt-4">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Gallery Statistics */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>معرض الصور</span>
        <span>{galleryImages.length} صورة</span>
      </div>



      {/* Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative w-full max-w-6xl h-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 bg-black/50 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Navigation Buttons */}
            {selectedImage > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 bg-black/50 rounded-full z-10"
                onClick={() => setSelectedImage(selectedImage - 1)}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}
            
            {selectedImage < galleryImages.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 bg-black/50 rounded-full z-10"
                onClick={() => setSelectedImage(selectedImage + 1)}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
            
            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={galleryImages[selectedImage]}
                  alt={`صورة ${selectedImage + 1}`}
                  width={1200}
                  height={800}
                  className="object-contain max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                  priority
                />
              </div>
            </div>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {selectedImage + 1} من {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}