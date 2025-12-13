'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AwardsFilterProps {
  onUpdate?: () => void;
}

export function AwardsFilter({ onUpdate }: AwardsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');

  const applyFilter = () => {
    const params = new URLSearchParams();
    
    if (company) {
      params.set('company', company);
    }
    
    if (type && type !== 'ALL') {
      params.set('type', type);
    }
    
    router.push(`/admin/awards?${params.toString()}`);
  };

  const clearFilter = () => {
    setCompany('');
    setType('ALL');
    router.push('/admin/awards');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilter();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث عن شركة..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
      </div>
      <div className="w-full md:w-48">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="نوع الجائزة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">جميع الأنواع</SelectItem>
            <SelectItem value="GOLD">جائزة ذهبية</SelectItem>
            <SelectItem value="SILVER">جائزة فضية</SelectItem>
            <SelectItem value="BRONZE">جائزة برونزية</SelectItem>
            <SelectItem value="CERTIFICATE">شهادة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button onClick={applyFilter} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Filter className="h-4 w-4 ml-2" />
          تطبيق الفلتر
        </Button>
        <Button onClick={clearFilter} variant="outline">
          مسح الفلتر
        </Button>
      </div>
    </div>
  );
}
