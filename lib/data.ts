export interface Country {
  code: string;
  name: string;
  flag: string;
  image: string;
  description: string;
  companiesCount: number;
}

export interface City {
  slug: string;
  name: string;
  country: string;
  image: string;
  description: string;
  companiesCount: number;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export interface Company {
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  category: string;
  city: string;
  country: string;
  image: string;
  logoImage?: string;
  images: string[];
  phone: string;
  email: string;
  website: string;
  address: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  location: {
    lat: number;
    lng: number;
  };
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  services?: string[];
  specialties?: string[];
}

// Sample data
export const countries: Country[] = [
  {
    code: 'sy',
    name: 'سوريا',
    flag: '🇸🇾',
    image: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
    description: 'اكتشف أفضل الشركات والخدمات في سوريا',
    companiesCount: 450,
  },
  {
    code: 'lb',
    name: 'لبنان',
    flag: '🇱🇧',
    image: 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg',
    description: 'دليل شامل للشركات في لبنان',
    companiesCount: 320,
  },
  {
    code: 'jo',
    name: 'الأردن',
    flag: '🇯🇴',
    image: 'https://images.pexels.com/photos/1583582/pexels-photo-1583582.jpeg',
    description: 'دليل الشركات الأردنية',
    companiesCount: 280,
  },
  {
    code: 'eg',
    name: 'مصر',
    flag: '🇪🇬',
    image: 'https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg',
    description: 'دليل شامل للشركات في مصر',
    companiesCount: 650,
  },
];

export const cities: City[] = [
  {
    slug: 'damascus',
    name: 'دمشق',
    country: 'sy',
    image: 'https://images.pexels.com/photos/2318271/pexels-photo-2318271.jpeg',
    description: 'عاصمة سوريا ومركز الأعمال',
    companiesCount: 200,
  },
  {
    slug: 'aleppo',
    name: 'حلب',
    country: 'sy',
    image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
    description: 'المدينة التجارية الكبرى',
    companiesCount: 150,
  },
  {
    slug: 'beirut',
    name: 'بيروت',
    country: 'lb',
    image: 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg',
    description: 'عاصمة لبنان ومركز المال والأعمال',
    companiesCount: 180,
  },
  {
    slug: 'amman',
    name: 'عمان',
    country: 'jo',
    image: 'https://images.pexels.com/photos/1583582/pexels-photo-1583582.jpeg',
    description: 'العاصمة الأردنية',
    companiesCount: 160,
  },
];

export const categories: Category[] = [
  {
    slug: 'technology',
    name: 'التكنولوجيا',
    icon: 'Laptop',
    description: 'شركات التكنولوجيا والبرمجة',
  },
  {
    slug: 'healthcare',
    name: 'الرعاية الصحية',
    icon: 'Heart',
    description: 'المستشفيات والعيادات الطبية',
  },
  {
    slug: 'education',
    name: 'التعليم',
    icon: 'GraduationCap',
    description: 'المدارس والجامعات ومراكز التدريب',
  },
  {
    slug: 'finance',
    name: 'المالية والمصرفية',
    icon: 'Banknote',
    description: 'البنوك وشركات التأمين والاستثمار',
  },
  {
    slug: 'food',
    name: 'الأغذية والمطاعم',
    icon: 'Utensils',
    description: 'المطاعم والكافيهات وتجارة الأغذية',
  },
  {
    slug: 'retail',
    name: 'التجارة والبيع',
    icon: 'ShoppingBag',
    description: 'المتاجر ومراكز التسوق',
  },
  {
    slug: 'beauty',
    name: 'الجمال والعناية',
    icon: 'Scissors',
    description: 'صالونات الحلاقة ومراكز التجميل',
  },
  {
    slug: 'construction',
    name: 'البناء والإنشاء',
    icon: 'HardHat',
    description: 'شركات البناء والمقاولات',
  },
  {
    slug: 'energy',
    name: 'الطاقة والبيئة',
    icon: 'Zap',
    description: 'شركات الطاقة المتجددة والبيئة',
  },
];

export const companies: Company[] = [
  {
    slug: 'abc-tech',
    name: 'ABC التقنية',
    description: 'شركة رائدة في مجال تطوير البرمجيات والتطبيقات المحمولة',
    shortDescription: 'شركة رائدة في تطوير البرمجيات والتطبيقات',
    longDescription: 'شركة ABC التقنية هي إحدى الشركات الرائدة في مجال تطوير البرمجيات والتطبيقات المحمولة في سوريا. تأسست الشركة عام 2015 وقد نجحت في تقديم حلول تقنية مبتكرة لأكثر من 500 عميل محلي وإقليمي. نتخصص في تطوير المواقع الإلكترونية، التطبيقات المحمولة، أنظمة إدارة المحتوى، والحلول السحابية. فريقنا المؤهل من المطورين والمصممين يعمل وفق أحدث المعايير العالمية لضمان تقديم منتجات عالية الجودة تلبي احتياجات عملائنا وتساعدهم على تحقيق أهدافهم التجارية.',
    category: 'technology',
    city: 'damascus',
    country: 'sy',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    images: [
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
    ],
    phone: '+963 11 2345678',
    email: 'info@abc-tech.sy',
    website: 'https://abc-tech.sy',
    address: 'شارع بغداد، دمشق، سوريا',
    tags: ['تطوير المواقع', 'التطبيقات المحمولة', 'الذكاء الاصطناعي'],
    rating: 4.8,
    reviewsCount: 124,
    location: {
      lat: 33.5138,
      lng: 36.2765,
    },
    workingHours: {
      'الأحد': { open: '09:00', close: '17:00' },
      'الاثنين': { open: '09:00', close: '17:00' },
      'الثلاثاء': { open: '09:00', close: '17:00' },
      'الأربعاء': { open: '09:00', close: '17:00' },
      'الخميس': { open: '09:00', close: '17:00' },
      'الجمعة': { closed: true, open: '', close: '' },
      'السبت': { open: '09:00', close: '14:00' },
    },
    socialMedia: {
      facebook: 'https://facebook.com/abctech',
      twitter: 'https://twitter.com/abctech',
      linkedin: 'https://linkedin.com/company/abctech',
    },
    services: ['تطوير المواقع الإلكترونية', 'تطبيقات الهاتف المحمول', 'التجارة الإلكترونية', 'الحلول السحابية'],
    specialties: ['React.js', 'Node.js', 'Mobile Development', 'Cloud Solutions', 'UI/UX Design'],
  },
  {
    slug: 'green-hospital',
    name: 'مستشفى الأخضر',
    description: 'مستشفى متخصص في الرعاية الصحية الشاملة مع أحدث التقنيات الطبية',
    shortDescription: 'مستشفى متخصص في الرعاية الصحية الشاملة',
    longDescription: 'مستشفى الأخضر هو مؤسسة طبية رائدة في دمشق، يقدم خدمات الرعاية الصحية الشاملة منذ عام 2010. يضم المستشفى أحدث الأجهزة الطبية والتقنيات المتطورة، ويعمل به فريق طبي متخصص من أفضل الأطباء والممرضين. نوفر خدمات متنوعة تشمل الطب العام، الجراحة، طب الأطفال، أمراض النساء والولادة، والطوارئ على مدار الساعة. هدفنا تقديم أفضل رعاية طبية للمرضى في بيئة آمنة ومريحة مع الحفاظ على أعلى معايير الجودة والسلامة.',
    category: 'healthcare',
    city: 'damascus',
    country: 'sy',
    image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
    images: [
      'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/139398/pexels-photo-139398.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/48604/pexels-photo-48604.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    phone: '+963 11 3456789',
    email: 'info@green-hospital.sy',
    website: 'https://green-hospital.sy',
    address: 'شارع الثورة، دمشق، سوريا',
    tags: ['طب عام', 'جراحة', 'طوارئ', 'أطفال'],
    rating: 4.6,
    reviewsCount: 89,
    location: {
      lat: 33.5102,
      lng: 36.2913,
    },
    workingHours: {
      'الأحد': { open: '08:00', close: '20:00' },
      'الاثنين': { open: '08:00', close: '20:00' },
      'الثلاثاء': { open: '08:00', close: '20:00' },
      'الأربعاء': { open: '08:00', close: '20:00' },
      'الخميس': { open: '08:00', close: '20:00' },
      'الجمعة': { open: '08:00', close: '20:00' },
      'السبت': { open: '08:00', close: '20:00' },
    },
    socialMedia: {
      facebook: 'https://facebook.com/greenhospital',
      instagram: 'https://instagram.com/greenhospital',
    },
    services: ['طب عام', 'جراحة عامة', 'طب الأطفال', 'أمراض النساء', 'طوارئ 24/7', 'مختبر طبي'],
    specialties: ['جراحة القلب', 'جراحة العظام', 'طب الأسنان', 'الأشعة التشخيصية', 'العلاج الطبيعي'],
  },
  {
    slug: 'abu-ali-restaurant',
    name: 'مطعم أبو علي الشعبي',
    description: 'مطعم شعبي أصيل يقدم أشهى المأكولات السورية التقليدية بأسعار مناسبة',
    shortDescription: 'مطعم شعبي أصيل للمأكولات السورية التقليدية',
    longDescription: 'مطعم أبو علي الشعبي هو واحد من أعرق المطاعم الشعبية في دمشق، تأسس عام 1985 على يد الحاج أبو علي. يتميز المطعم بتقديم الأطباق السورية الأصيلة المحضرة بطرق تقليدية وبمكونات طازجة عالية الجودة. نحن متخصصون في تقديم المأكولات الشامية الشعبية مثل الكبة، الفتة، المحاشي، والشاورما بأسعار في متناول الجميع. يتميز المطعم بأجوائه الشعبية الدافئة وخدمته السريعة، مما جعله مقصداً للعائلات والشباب من جميع أنحاء دمشق. نفتخر بالحفاظ على النكهة الأصيلة والجودة العالية التي جعلتنا نكسب ثقة زبائننا لأكثر من 35 عاماً.',
    category: 'food',
    city: 'damascus',
    country: 'sy',
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
    images: [
      'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    phone: '+963 11 4567890',
    email: 'info@abuali-restaurant.sy',
    website: 'https://abuali-restaurant.sy',
    address: 'سوق الحميدية، دمشق القديمة، سوريا',
    tags: ['مأكولات شامية', 'طعام شعبي', 'أسعار مناسبة', 'عائلي'],
    rating: 4.5,
    reviewsCount: 156,
    location: {
      lat: 33.5117,
      lng: 36.3067,
    },
    workingHours: {
      'الأحد': { open: '10:00', close: '23:00' },
      'الاثنين': { open: '10:00', close: '23:00' },
      'الثلاثاء': { open: '10:00', close: '23:00' },
      'الأربعاء': { open: '10:00', close: '23:00' },
      'الخميس': { open: '10:00', close: '23:00' },
      'الجمعة': { open: '12:00', close: '23:00' },
      'السبت': { open: '10:00', close: '23:00' },
    },
    socialMedia: {
      facebook: 'https://facebook.com/abuali.restaurant',
      instagram: 'https://instagram.com/abuali_restaurant',
    },
    services: ['تناول في المطعم', 'خدمة التوصيل', 'طلبات خارجية', 'مناسبات عائلية'],
    specialties: ['كبة حلبية', 'فتة حمص', 'محاشي ورق عنب', 'شاورما لحمة', 'فروج مشوي', 'حمص بالطحينة'],
  },
  {
    slug: 'levantine-palace',
    name: 'قصر الشام الراقي',
    description: 'مطعم راقي يقدم تجربة طعام فاخرة مع أجود المأكولات الشرقية والعالمية',
    shortDescription: 'مطعم راقي للمأكولات الشرقية والعالمية الفاخرة',
    longDescription: 'قصر الشام الراقي هو أحد أرقى المطاعم في دمشق، يقع في منطقة أبو رمانة الراقية. افتتح المطعم عام 2018 ليقدم تجربة طعام استثنائية تجمع بين النكهات الشرقية الأصيلة والمأكولات العالمية الراقية. يتميز المطعم بديكوره الفاخر المستوحى من الطراز الدمشقي الأصيل مع لمسات عصرية أنيقة. يضم المطعم فريقاً من أمهر الطهاة المتخصصين في المأكولات الشرقية والأوروبية، ويقدم قائمة طعام متنوعة تشمل أطباق اللحوم المشوية، المأكولات البحرية الطازجة، والحلويات الشرقية الفاخرة. كما يوفر المطعم صالات خاصة للمناسبات والاجتماعات التجارية مع خدمة راقية ومتميزة.',
    category: 'food',
    city: 'damascus',
    country: 'sy',
    image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg',
    images: [
      'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1484516/pexels-photo-1484516.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1581554/pexels-photo-1581554.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1395965/pexels-photo-1395965.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    phone: '+963 11 5678901',
    email: 'reservations@levantine-palace.sy',
    website: 'https://levantine-palace.sy',
    address: 'شارع بغداد، أبو رمانة، دمشق، سوريا',
    tags: ['مطعم راقي', 'مأكولات عالمية', 'أجواء فاخرة', 'مناسبات خاصة'],
    rating: 4.9,
    reviewsCount: 98,
    location: {
      lat: 33.5020,
      lng: 36.2854,
    },
    workingHours: {
      'الأحد': { open: '12:00', close: '01:00' },
      'الاثنين': { open: '12:00', close: '01:00' },
      'الثلاثاء': { open: '12:00', close: '01:00' },
      'الأربعاء': { open: '12:00', close: '01:00' },
      'الخميس': { open: '12:00', close: '01:00' },
      'الجمعة': { open: '12:00', close: '01:00' },
      'السبت': { open: '12:00', close: '01:00' },
    },
    socialMedia: {
      facebook: 'https://facebook.com/levantinepalace',
      instagram: 'https://instagram.com/levantine_palace',
      linkedin: 'https://linkedin.com/company/levantine-palace',
    },
    services: ['تناول راقي', 'صالات خاصة', 'حفلات ومناسبات', 'خدمة كيترينغ', 'حجز مسبق'],
    specialties: ['ستيك لحم أنغوس', 'سمك السلمون المشوي', 'أرز بخاري باللحم', 'حلويات شرقية فاخرة', 'مقبلات شامية راقية', 'مشاوي مختلطة'],
  },
  {
    slug: 'master-barber-salon',
    name: 'صالون الأسطى للحلاقة',
    description: 'صالون حلاقة رجالي عصري يقدم أحدث قصات الشعر وخدمات العناية بالرجال',
    shortDescription: 'صالون حلاقة رجالي عصري متخصص في قصات الشعر الحديثة',
    longDescription: 'صالون الأسطى للحلاقة هو واحد من أفضل صالونات الحلاقة الرجالية في دمشق، تأسس عام 2012 على يد الأسطى محمد الذي يتمتع بخبرة تزيد عن 20 عاماً في مجال الحلاقة وتصفيف الشعر. يتميز الصالون بأجوائه العصرية والمريحة، ويقدم مجموعة شاملة من خدمات العناية بالرجال تشمل قص الشعر بأحدث الطرق، تهذيب اللحية والشارب، الحلاقة التقليدية بالموس، وخدمات العناية بالبشرة. يستخدم الصالون أجود أنواع المنتجات العالمية ويحرص على تطبيق أعلى معايير النظافة والتعقيم. كما يوفر الصالون خدمة الحجز المسبق عبر الهاتف أو التطبيق الإلكتروني لضمان راحة العملاء.',
    category: 'beauty',
    city: 'damascus',
    country: 'sy',
    image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
    images: [
      'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1570808/pexels-photo-1570808.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1570805/pexels-photo-1570805.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3618160/pexels-photo-3618160.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3618161/pexels-photo-3618161.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    phone: '+963 11 6789012',
    email: 'info@master-barber.sy',
    website: 'https://master-barber.sy',
    address: 'شارع النصر، الشعلان، دمشق، سوريا',
    tags: ['حلاقة رجالي', 'قصات عصرية', 'تهذيب لحية', 'عناية بالرجال'],
    rating: 4.7,
    reviewsCount: 203,
    location: {
      lat: 33.5089,
      lng: 36.2801,
    },
    workingHours: {
      'الأحد': { open: '09:00', close: '21:00' },
      'الاثنين': { open: '09:00', close: '21:00' },
      'الثلاثاء': { open: '09:00', close: '21:00' },
      'الأربعاء': { open: '09:00', close: '21:00' },
      'الخميس': { open: '09:00', close: '21:00' },
      'الجمعة': { open: '13:00', close: '21:00' },
      'السبت': { open: '09:00', close: '21:00' },
    },
    socialMedia: {
      facebook: 'https://facebook.com/masterbarber',
      instagram: 'https://instagram.com/master_barber_salon',
    },
    services: ['قص شعر رجالي', 'تهذيب لحية وشارب', 'حلاقة بالموس', 'ماسك وجه للرجال', 'تصفيف شعر للمناسبات'],
    specialties: ['قصة الفيد', 'قصة الأندركت', 'تشذيب اللحية الكلاسيكي', 'الحلاقة التركية', 'ماسك الفحم للوجه', 'تدليك فروة الرأس'],
  },
  {
    slug: 'damascus-construction',
    name: 'شركة دمشق للإنشاءات',
    description: 'شركة رائدة في مجال البناء والإنشاءات مع خبرة تزيد عن 25 عاماً في تنفيذ المشاريع السكنية والتجارية',
    shortDescription: 'شركة رائدة في البناء والإنشاءات السكنية والتجارية',
    longDescription: 'شركة دمشق للإنشاءات هي إحدى أعرق شركات البناء في سوريا، تأسست عام 1998 وقد نجحت في تنفيذ أكثر من 300 مشروع سكني وتجاري في دمشق وضواحيها. تتميز الشركة بفريق عمل مؤهل من المهندسين والفنيين المتخصصين، وتستخدم أحدث التقنيات والمواد عالية الجودة في جميع مشاريعها. خدماتنا تشمل تصميم وتنفيذ المباني السكنية، المجمعات التجارية، المكاتب، والمنشآت الصناعية. نحن ملتزمون بتطبيق أعلى معايير الجودة والسلامة، والالتزام بالمواعيد المحددة، وتقديم أسعار تنافسية. كما نوفر خدمات ما بعد البيع والصيانة لضمان رضا عملائنا التام.',
    category: 'construction',
    city: 'damascus',
    country: 'sy',
    image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg',
    images: [
      'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1216585/pexels-photo-1216585.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/162539/architecture-building-amsterdam-blue-162539.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1216588/pexels-photo-1216588.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/834892/pexels-photo-834892.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1216584/pexels-photo-1216584.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1216587/pexels-photo-1216587.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/273209/pexels-photo-273209.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1216586/pexels-photo-1216586.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    phone: '+963 11 7890123',
    email: 'info@damascus-construction.sy',
    website: 'https://damascus-construction.sy',
    address: 'شارع الملكي، كفرسوسة، دمشق، سوريا',
    tags: ['بناء سكني', 'مشاريع تجارية', 'مقاولات عامة', 'تصميم معماري'],
    rating: 4.6,
    reviewsCount: 87,
    location: {
      lat: 33.4953,
      lng: 36.2564,
    },
    workingHours: {
      'الأحد': { open: '08:00', close: '17:00' },
      'الاثنين': { open: '08:00', close: '17:00' },
      'الثلاثاء': { open: '08:00', close: '17:00' },
      'الأربعاء': { open: '08:00', close: '17:00' },
      'الخميس': { open: '08:00', close: '17:00' },
      'الجمعة': { closed: true, open: '', close: '' },
      'السبت': { open: '08:00', close: '14:00' },
    },
    socialMedia: {
      facebook: 'https://facebook.com/damascusconstruction',
      linkedin: 'https://linkedin.com/company/damascus-construction',
    },
    services: ['بناء المنازل السكنية', 'المجمعات التجارية', 'التصميم المعماري', 'إدارة المشاريع', 'الصيانة والترميم'],
    specialties: ['البناء بالحجر الطبيعي', 'الهياكل الخرسانية', 'التشطيبات الفاخرة', 'العزل الحراري والمائي', 'أنظمة السلامة', 'التصاميم المعاصرة'],
  },
  {
    slug: 'syria-solar-energy',
    name: 'شركة سوريا للطاقة الشمسية',
    description: 'شركة متخصصة في تركيب وصيانة أنظمة الطاقة الشمسية للمنازل والمؤسسات التجارية والصناعية',
    shortDescription: 'شركة متخصصة في أنظمة الطاقة الشمسية والمتجددة',
    longDescription: 'شركة سوريا للطاقة الشمسية هي إحدى الشركات الرائدة في مجال الطاقة المتجددة في سوريا، تأسست عام 2016 مع رؤية واضحة لتوفير حلول طاقة نظيفة ومستدامة. نتخصص في تصميم وتركيب وصيانة أنظمة الطاقة الشمسية للمنازل والمباني التجارية والمنشآت الصناعية. فريقنا المتخصص من المهندسين والفنيين يقدم استشارات شاملة لتحديد الحلول الأمثل لكل عميل بناءً على احتياجاته وميزانيته. نستخدم أحدث التقنيات والمعدات عالية الجودة من أفضل الشركات العالمية، ونوفر ضمانات طويلة المدى على جميع منتجاتنا وخدماتنا. هدفنا مساعدة عملائنا على تحقيق الاستقلالية في الطاقة وتوفير المال على المدى الطويل.',
    category: 'energy',
    city: 'damascus',
    country: 'sy',
    image: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg',
    images: [
      'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/421888/pexels-photo-421888.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/371900/pexels-photo-371900.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2800833/pexels-photo-2800833.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159160/solar-panel-array-power-sun-electricity-159160.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2800834/pexels-photo-2800834.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    phone: '+963 11 8901234',
    email: 'info@syria-solar.sy',
    website: 'https://syria-solar.sy',
    address: 'شارع الجلاء، المزة، دمشق، سوريا',
    tags: ['طاقة شمسية', 'طاقة متجددة', 'توفير الكهرباء', 'صديقة للبيئة'],
    rating: 4.8,
    reviewsCount: 142,
    location: {
      lat: 33.4925,
      lng: 36.2692,
    },
    workingHours: {
      'الأحد': { open: '08:30', close: '16:30' },
      'الاثنين': { open: '08:30', close: '16:30' },
      'الثلاثاء': { open: '08:30', close: '16:30' },
      'الأربعاء': { open: '08:30', close: '16:30' },
      'الخميس': { open: '08:30', close: '16:30' },
      'الجمعة': { closed: true, open: '', close: '' },
      'السبت': { open: '09:00', close: '13:00' },
    },
    socialMedia: {
      facebook: 'https://facebook.com/syriasolar',
      instagram: 'https://instagram.com/syria_solar_energy',
      linkedin: 'https://linkedin.com/company/syria-solar-energy',
    },
    services: ['تركيب الألواح الشمسية', 'أنظمة التخزين بالبطاريات', 'الصيانة الدورية', 'الاستشارات الفنية', 'أنظمة المراقبة والتحكم'],
    specialties: ['أنظمة الطاقة الشمسية السكنية', 'الحلول التجارية والصناعية', 'أنظمة الضخ الشمسي', 'الإنارة الشمسية', 'أنظمة التسخين الشمسي', 'الشبكات الذكية'],
  },
];

// Helper functions
export function getCountryData(countryCode: string): Country | undefined {
  return countries.find(c => c.code === countryCode);
}

export function getCountryCities(countryCode: string): City[] {
  return cities.filter(c => c.country === countryCode);
}

export function getCountryCompanies(countryCode: string): Company[] {
  return companies.filter(c => c.country === countryCode);
}

export function getCityData(countryCode: string, citySlug: string): City | undefined {
  return cities.find(c => c.country === countryCode && c.slug === citySlug);
}

export function getCityCompanies(countryCode: string, citySlug: string): Company[] {
  return companies.filter(c => c.country === countryCode && c.city === citySlug);
}

export function getCompanyData(countryCode: string, citySlug: string, companySlug: string): Company | undefined {
  return companies.find(c => c.country === countryCode && c.city === citySlug && c.slug === companySlug);
}

export function getCategoryData(categorySlug: string): Category | undefined {
  return categories.find(c => c.slug === categorySlug);
}

export function getCategoryCompanies(countryCode: string, categorySlug: string): Company[] {
  return companies.filter(c => c.country === countryCode && c.category === categorySlug);
}