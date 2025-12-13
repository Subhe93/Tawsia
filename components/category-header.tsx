import { Building2 } from 'lucide-react';
import { Category } from '@/lib/data';

interface CategoryHeaderProps {
  category: any;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-brand-green to-brand-yellow rounded-2xl p-8 text-white">
      <div className="flex items-center space-x-4 space-x-reverse mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
      </div>
      
      <p className="text-xl text-white/90 max-w-2xl">
        {category.description}
      </p>
    </div>
  );
}