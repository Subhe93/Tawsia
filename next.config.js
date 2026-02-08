/** @type {import('next').NextConfig} */
const nextConfig = {
  // تحسين الأداء والـ SEO
  optimizeFonts: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // تحسين الصور
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
    // formats: ["image/webp", "image/avif"],
    // domains: [
    //   "images.pexels.com",
    //   "localhost",
    //   "twsia.com",
    //   "cdn.twsia.com",
    //   "images.example.com",
    //   "twsia.iwings-digital.com",
    // ],
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // minimumCacheTTL: 31536000, // سنة واحدة
  },

  // تحسين الـ Bundle
  webpack: (config, { dev, isServer }) => {
    // تفعيل الـ cache في الإنتاج
    if (!dev) {
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // تحسين الـ Bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // إعدادات التجريبية للأداء
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // ضغط الـ Static Assets
  compress: true,

  // تحسين الـ Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/company-dashboard/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300",
          },
        ],
      },
      {
        source: "/api/admin/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/api/company-dashboard/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      // استثناء الاستيثان و الايثين و الايثين يان من الـ caching
      {
        source: "/api/auth/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/api/admin/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },

  // إعادة التوجيه الثابتة فقط (800 + old-changed-slug تُدار من middleware)
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Rewrite rules للـ SEO
  // تم إزالة rewrites لـ sitemap و robots لاستخدام app/sitemap.ts و app/robots.ts
  // async rewrites() {
  //   return [];
  // },
};

module.exports = nextConfig;
