import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Widget configuration interface
interface WidgetConfig {
  size: "xl" | "l" | "m" | "s";
  orientation: "horizontal" | "vertical";
  theme: "light" | "dark";
  commentsCount: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const size = (searchParams.get("size") || "xl") as WidgetConfig["size"];
    const orientation = (searchParams.get("orientation") ||
      "horizontal") as WidgetConfig["orientation"];
    const theme = (searchParams.get("theme") ||
      "light") as WidgetConfig["theme"];
    const commentsCount = parseInt(searchParams.get("commentsCount") || "5");

    // Get company with reviews
    const company = await prisma.company.findUnique({
      where: { id: params.companyId },
      include: {
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    // Get total count of approved reviews
    const totalReviews = await prisma.review.count({
      where: {
        companyId: params.companyId,
        isApproved: true,
      },
    });

    // Calculate average rating from all approved reviews
    const ratingData = await prisma.review.aggregate({
      where: {
        companyId: params.companyId,
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
    });
    const averageRating = ratingData._avg.rating || 0;

    // Generate HTML based on size
    const html = generateWidgetHTML({
      company,
      size,
      orientation,
      theme,
      totalReviews,
      averageRating,
      commentsCount,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "X-Frame-Options": "ALLOWALL",
      },
    });
  } catch (error) {
    console.error("Error generating widget:", error);
    return new NextResponse("Error generating widget", { status: 500 });
  }
}

function generateWidgetHTML(params: {
  company: any;
  size: WidgetConfig["size"];
  orientation: WidgetConfig["orientation"];
  theme: WidgetConfig["theme"];
  totalReviews: number;
  averageRating: number;
  commentsCount: number;
}): string {
  const {
    company,
    size,
    orientation,
    theme,
    totalReviews,
    averageRating,
    commentsCount,
  } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const companyUrl = `${baseUrl}/${company.slug}`;

  // Color scheme based on theme
  const colors =
    theme === "light"
      ? {
          bg: "#ffffff",
          text: "#1f2937",
          textSecondary: "#6b7280",
          border: "#e5e7eb",
          star: "#fbbf24",
          logoHover: "#f3f4f6",
        }
      : {
          bg: "#1f2937",
          text: "#f9fafb",
          textSecondary: "#9ca3af",
          border: "#374151",
          star: "#fbbf24",
          logoHover: "#374151",
        };

  // Size configurations
  const sizeConfig = {
    xl: {
      container:
        orientation === "horizontal"
          ? "min-height: 160px;"
          : "min-height: 320px;",
      reviewCard:
        "padding: 8px 10px; border-radius: 8px; border: 1px solid " +
        colors.border +
        "; background: " +
        colors.bg +
        ";",
      fontSize: "13px",
      logoSize: "32px",
      showFullReviews: true,
    },
    l: {
      container:
        orientation === "horizontal"
          ? "min-height: 100px;"
          : "min-height: 240px;",
      reviewCard:
        "padding: 8px 10px; border-radius: 8px; border: 1px solid " +
        colors.border +
        "; background: " +
        colors.bg +
        ";",
      fontSize: "13px",
      logoSize: "28px",
      showFullReviews: true,
    },
    m: {
      container:
        orientation === "horizontal"
          ? "min-height: 80px;"
          : "min-height: 160px;",
      reviewCard:
        "padding: 6px 8px; border-radius: 8px; border: 1px solid " +
        colors.border +
        "; background: " +
        colors.bg +
        ";",
      fontSize: "12px",
      logoSize: "24px",
      showFullReviews: true,
    },
    s: {
      container:
        orientation === "horizontal"
          ? "min-height: 80px;"
          : "min-height: 160px;",
      reviewCard:
        "padding: 6px 8px; border-radius: 8px; border: 1px solid " +
        colors.border +
        "; background: " +
        colors.bg +
        ";",
      fontSize: "12px",
      logoSize: "24px",
      showFullReviews: true,
    },
  };

  const config = sizeConfig[size];

  // Handle vertical orientation separately
  if (orientation === "vertical") {
    return generateVerticalWidget({
      company,
      size,
      theme,
      colors,
      totalReviews,
      averageRating,
      commentsCount,
      companyUrl,
    });
  }

  // For horizontal L or M size, show only summary row (like S size)
  const showOnlySummary =
    ((size === "l" || size === "m") && orientation === "horizontal") ||
    size === "s";

  // For M or S size horizontal, use inline layout (title near value)
  const useInlineLayout =
    (size === "m" || size === "s") && orientation === "horizontal";
  const inlineFontSize = size === "s" ? "10px" : "12px";
  const inlineIconSize = size === "s" ? "12" : "14";
  const inlineButtonFontSize = size === "s" ? "9px" : "11px";
  const inlinePadding = size === "s" ? "4px 10px" : "8px 16px";
  const inlineGap = size === "s" ? "8px" : "12px";
  const inlineButtonPadding = size === "s" ? "4px 8px" : "6px 10px";

  if (!showOnlySummary && (size === "xl" || size === "l" || size === "m")) {
    // Full reviews display with cards
    const reviewsHTML =
      company.reviews.length > 0
        ? company.reviews
            .map(
              (review: any, index: number) => `
      <a href="${companyUrl}" target="_blank" class="review-slide" style="${config.reviewCard} width: ${
        size === "m" ? "120px" : size === "l" ? "200px" : "225px"
      }; min-height: ${
        size === "m" ? "60px" : size === "l" ? "100px" : "150px"
      }; display: flex; flex-direction: column; flex-shrink: 0; text-decoration: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; ${
        size === "m" ? "justify-content: center; align-items: center;" : ""
      }">
        ${
          size === "xl"
            ? `<!-- Mobile: stars + name in one row -->
        <div class="review-header-mobile" style="display: none; align-items: center; gap: 8px; margin-bottom: 4px;">
          ${generateStars(review.rating, colors.star, 12)}
          <span style="font-size: 11px; font-weight: 600; color: ${colors.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(review.userName || review.user?.name || "مستخدم غير معروف")}
          </span>
        </div>
        <!-- Desktop: stars only -->
        <div class="review-header-desktop" style="display: flex; align-items: center; margin-bottom: 2px;">
          ${generateStars(review.rating, colors.star, 14)}
        </div>`
            : `<div style="display: flex; align-items: center; margin-bottom: ${
                size === "m" ? "0" : "2px"
              };">
          ${generateStars(review.rating, colors.star, size === "m" ? 12 : 14)}
        </div>`
        }
    
        ${
          size === "xl"
            ? `<p style="color: ${
                colors.textSecondary
              }; margin: 0; font-size: 12px; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; word-break: break-word;">
          ${escapeHtml(truncateText(review.comment, 55))}
        </p>`
            : ""
        }
        ${
          size === "m"
            ? review.isVerified
              ? `<div style="font-size: 9px; color: #3b82f6; margin-top: 4px; display: flex; align-items: center; gap: 2px;">
          <span>موثق</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3" xmlns="http://www.w3.org/2000/svg">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>`
              : `<div style="font-size: 9px; color: #ef4444; margin-top: 4px; display: flex; align-items: center; gap: 2px;">
          <span>غير موثق</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>`
            : ""
        }
        ${
          size === "l" || size === "xl"
            ? `<div class="review-footer" style="display: flex; align-items: center; margin-top: auto; gap: 4px; padding-top: 4px; border-top: 1px solid ${
                colors.border
              };">

          <div style="min-width: 0; flex: 1; overflow: hidden;">
            <div style="font-size: 11px; font-weight: 600; color: ${
              colors.text
            }; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px;">
              <span>${escapeHtml(
                review.userName || review.user?.name || "مستخدم غير معروف",
              )}</span>
              <span class="review-date" style="font-size: 10px; color: ${
                colors.textSecondary
              }; font-weight: 400;">
                ${formatDate(review.createdAt)}
              </span>
            </div>
            <div class="review-verified" style="${
              review.isVerified
                ? `font-size: 10px; color: #3b82f6; margin-top: 2px; display: flex; align-items: center; gap: 3px;`
                : `font-size: 10px; color: #ef4444; margin-top: 2px; display: flex; align-items: center; gap: 3px;`
            }">
              ${
                review.isVerified
                  ? `<span>موثق</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>`
                  : `<span>غير موثق</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>`
              }
            </div>
          </div>
        </div>`
            : ""
        }
      </a>
    `,
            )
            .join("")
        : `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${
          colors.textSecondary
        }" stroke-width="2" style="margin-bottom: 16px;">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <h3 style="font-size: 18px; font-weight: 600; color: ${
          colors.text
        }; margin-bottom: 8px;">لا توجد مراجعات بعد</h3>
        <p style="font-size: 14px; color: ${
          colors.textSecondary
        }; margin-bottom: 16px;">كن أول من يكتب مراجعة لـ ${escapeHtml(
          company.name,
        )}</p>
        <a href="${companyUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          اكتب مراجعة
        </a>
      </div>
      `;

    const cardsPerView = orientation === "horizontal" ? 4 : 2;
    const totalCards = company.reviews.length;
    const sliderHTML =
      company.reviews.length > 0
        ? `
      <div class="slider-container" style="position: relative; padding: ${
        orientation === "horizontal" ? "5px 5px" : "60px 20px"
      }; ${sizeConfig[size].container}">
        <div class="slider-wrapper" style="overflow: hidden; position: relative; width: 100%;">
          <div class="slider-track" id="sliderTrack" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; ${
            orientation === "horizontal" ? "" : "flex-direction: column;"
          } gap: 8px; transition: transform 0.5s ease;">
            ${reviewsHTML}
          </div>
        </div>
        ${
          company.reviews.length > cardsPerView
            ? `
        <button class="slider-btn next" id="nextBtn" onclick="slideReviews('next')" style="position: absolute; ${
          orientation === "horizontal"
            ? "top: 50%; left: 10px; transform: translateY(-50%);"
            : "bottom: 10px; right: 50%; transform: translateX(50%) rotate(90deg);"
        }; background: ${colors.bg}; border: 2px solid ${
          colors.border
        }; border-radius: 50%; width: 40px; height: 40px; align-items: center; justify-content: center; cursor: pointer; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s; display: flex;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${
            colors.text
          }" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="slider-btn prev" id="prevBtn" onclick="slideReviews('prev')" style="position: absolute; ${
          orientation === "horizontal"
            ? "top: 50%; right: 10px; transform: translateY(-50%);"
            : "top: 10px; right: 50%; transform: translateX(50%) rotate(90deg);"
        }; background: ${colors.bg}; border: 2px solid ${
          colors.border
        }; border-radius: 50%; width: 40px; height: 40px; align-items: center; justify-content: center; cursor: pointer; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s; display: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${
            colors.text
          }" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        `
            : ""
        }
      </div>
      <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.review-slide');
        const isHorizontal = '${orientation}' === 'horizontal';
        const slidesPerView = isHorizontal ? 4 : 2;
        const totalSlides = slides.length;
        const maxSlide = Math.max(0, totalSlides - slidesPerView);
        
        function updateButtons() {
          const nextBtn = document.getElementById('nextBtn');
          const prevBtn = document.getElementById('prevBtn');
          
          if (nextBtn && prevBtn) {
            // Show next button only if not at the end
            if (currentSlide < maxSlide) {
              nextBtn.style.display = 'flex';
            } else {
              nextBtn.style.display = 'none';
            }
            
            // Show prev button only if not at the start
            if (currentSlide > 0) {
              prevBtn.style.display = 'flex';
            } else {
              prevBtn.style.display = 'none';
            }
          }
        }
        
        function slideReviews(direction) {
          if (direction === 'next') {
            currentSlide = Math.min(currentSlide + 1, maxSlide);
          } else {
            currentSlide = Math.max(currentSlide - 1, 0);
          }
          
          const track = document.getElementById('sliderTrack');
          if (isHorizontal) {
            const slideWidth = 296; // 280px card + 16px gap
            // RTL: positive translateX moves track right, revealing cards on the left
            track.style.transform = 'translateX(' + (currentSlide * slideWidth) + 'px)';
          } else {
            const firstSlide = slides[0];
            const slideHeight = firstSlide ? firstSlide.offsetHeight + 16 : 200;
            track.style.transform = 'translateY(-' + (currentSlide * slideHeight) + 'px)';
          }
          
          updateButtons();
        }
        
        // Initialize - show only next button at start
        updateButtons();
      </script>
    `
        : reviewsHTML;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      direction: rtl;
    }
    .slider-btn:hover {
      background: ${colors.logoHover};
      transform: translateY(-50%) scale(1.1) !important;
    }
    .slider-btn:active {
      transform: translateY(-50%) scale(0.95) !important;
    }
    .review-slide:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .logo-link {
      position: fixed;
      bottom: 16px;
      left: 16px;
      width: ${config.logoSize};
      height: ${config.logoSize};
      background: ${colors.bg};
      border: 2px solid ${colors.border};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      z-index: 1000;
      text-decoration: none;
    }
    .logo-link:hover {
      background: ${colors.logoHover};
      transform: scale(1.1);
    }
    
    /* Desktop styles */
    .summary-desktop { display: flex; }
    .summary-mobile { display: none; }
    .review-header-mobile { display: none !important; }
    .review-header-desktop { display: flex !important; }
    .review-footer { display: flex !important; }
    .review-date { display: inline !important; }
    .review-verified { display: flex !important; }
    
    /* Mobile styles for XL size */
    @media (max-width: 600px) {
      .slider-container {
        min-height: 110px !important;
      }
      .review-slide {
        width: 160px !important;
        min-height: 100px !important;
        padding: 8px !important;
      }
      .review-header-mobile { display: flex !important; }
      .review-header-desktop { display: none !important; }
      .review-footer { display: none !important; }
      .review-date { display: none !important; }
      .review-verified { display: none !important; }
      .summary-desktop { display: none !important; }
      .summary-mobile { display: block !important; }
      .disclaimer-text { display: none !important; }
      .slider-btn {
        width: 32px !important;
        height: 32px !important;
      }
      .slider-btn svg {
        width: 16px !important;
        height: 16px !important;
      }
    }
  </style>
</head>
<body>
  ${sliderHTML}
  ${
    company.reviews.length > 0
      ? `
  <!-- Desktop Summary -->
  <div class="summary-desktop" style="display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 8px 16px; border-top: 1px solid ${
    colors.border
  }; background: ${colors.bg}; font-size: 12px;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <span style="color: ${
          colors.textSecondary
        }; font-size: 10px;">إجمالي التوصيات</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${
            colors.star
          }" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span style="font-weight: 600; color: ${
            colors.text
          };">${totalReviews}</span>
        </div>
      </div>
      <div style="width: 1px; height: 32px; background: ${
        colors.border
      };"></div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <span style="color: ${
          colors.textSecondary
        }; font-size: 10px;">متوسط التقييم</span>
        <span style="font-weight: 600; color: ${
          colors.text
        };">${averageRating.toFixed(1)}/5</span>
      </div>
      <div style="width: 1px; height: 32px; background: ${
        colors.border
      };"></div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
        <span style="color: ${colors.textSecondary};">آخر</span>
        <span style="font-weight: 600; color: ${colors.text};">${
          company.reviews.length
        }</span>
        <span style="color: ${colors.textSecondary};">توصيات</span>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <a href="${companyUrl}" target="_blank" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500; transition: all 0.3s; border: none; cursor: pointer;">
      <span>عرض المزيد</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </a>
      <a href="${companyUrl}/add-review" target="_blank" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500; transition: all 0.3s; border: none; cursor: pointer;">
      <span>اكتب توصية</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </a>
      <a href="https://twsia.com" target="_blank" style="display: flex; align-items: center;">
        <img src="https://twsia.com/img/twsia-logo.png" alt="Tawsia" style="height: 28px; width: auto;" />
      </a>
    </div>
  </div>
  
  <!-- Mobile Summary - Two Column Layout -->
  <div class="summary-mobile" style="display: none; padding: 10px; border-top: 1px solid ${
    colors.border
  }; background: ${colors.bg};">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <!-- First Column: Total Rating -->
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px;">
        <span style="color: ${colors.textSecondary}; font-size: 11px;">إجمالي التوصيات</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${colors.star}" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span style="font-weight: 600; color: ${colors.text}; font-size: 16px;">${totalReviews}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <a href="${companyUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; padding: 5px 8px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 10px; font-weight: 500;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </a>
          <a href="${companyUrl}/add-review" target="_blank" style="display: flex; align-items: center; gap: 4px; padding: 5px 8px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 10px; font-weight: 500;">
            <span>اكتب توصية</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </a>
        </div>
      </div>
      <!-- Second Column: Average Rating -->
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px;">
        <span style="color: ${colors.textSecondary}; font-size: 11px;">متوسط التقييم</span>
        <span style="font-weight: 600; color: ${colors.text}; font-size: 16px;">${averageRating.toFixed(1)}/5</span>
        <a href="https://twsia.com" target="_blank" style="display: flex; align-items: center;">
          <img src="https://twsia.com/img/twsia-logo.png" alt="Tawsia" style="height: 22px; width: auto;" />
        </a>
      </div>
    </div>
    <!-- Disclaimer text for mobile -->
    <p style="font-size: 9px; color: ${colors.textSecondary}; margin: 8px 0 0 0; line-height: 1.4; text-align: right;">
      يمكن التحقق من صحة الاتصال عبر نظام إدارة الأعمال، من خلال التحقق من البيانات عبر البريد الإلكتروني أو الرسائل القصيرة.
    </p>
  </div>
  
  <div class="disclaimer-text" style="padding: 6px 16px; background: ${
    colors.bg
  }; border-top: 1px solid ${colors.border}; text-align: right;">
    <p style="font-size: 10px; color: ${
      colors.textSecondary
    }; margin: 0; line-height: 1.4;">
      يمكن التحقق من صحة الاتصال عبر نظام إدارة الأعمال، من خلال التحقق من البيانات عبر البريد الإلكتروني أو الرسائل القصيرة.
    </p>
  </div>
  `
      : ""
  }
</body>
</html>
    `;
  } else {
    // S size, horizontal L size, or horizontal M size: Summary row only
    const companyUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/${
      company.slug
    }`;

    // Inline layout for M or S size horizontal: "إجمالي التوصيات 7 | متوسط 4.8/5 | آخر 7 توصيات"
    const summaryContent = useInlineLayout
      ? `
  <div style="display: flex; align-items: center; justify-content: space-between; gap: ${inlineGap}; padding: ${inlinePadding}; border: 1px solid ${
    colors.border
  }; border-radius: 8px; background: ${
    colors.bg
  }; font-size: ${inlineFontSize};">
    <div style="display: flex; align-items: center; gap: ${inlineGap};">
      <div style="display: flex; align-items: center; gap: 4px;">
        <svg width="${inlineIconSize}" height="${inlineIconSize}" viewBox="0 0 24 24" fill="${
          colors.star
        }" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
        <span style="color: ${colors.textSecondary};">إجمالي التوصيات</span>
        <span style="font-weight: 600; color: ${
          colors.text
        };">${totalReviews}</span>
      </div>
      <div style="width: 1px; height: 16px; background: ${
        colors.border
      };"></div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="color: ${colors.textSecondary};">متوسط</span>
        <span style="font-weight: 600; color: ${
          colors.text
        };">${averageRating.toFixed(1)}/5</span>
      </div>
      <div style="width: 1px; height: 16px; background: ${
        colors.border
      };"></div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="color: ${colors.textSecondary};">آخر</span>
        <span style="font-weight: 600; color: ${colors.text};">${
          company.reviews.length
        }</span>
        <span style="color: ${colors.textSecondary};">توصيات</span>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 6px;">
      <a href="${companyUrl}" target="_blank" style="display: flex; align-items: center; gap: 4px; padding: ${inlineButtonPadding}; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: ${inlineButtonFontSize}; font-weight: 500; transition: all 0.3s; border: none; cursor: pointer;">
        <svg width="${inlineIconSize}" height="${inlineIconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>المزيد</span>
      </a>
      <a href="${companyUrl}/add-review" target="_blank" style="display: flex; align-items: center; gap: 4px; padding: ${inlineButtonPadding}; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: ${inlineButtonFontSize}; font-weight: 500; transition: all 0.3s; border: none; cursor: pointer;">
      <span> اكتب توصية</span>
        <svg width="${inlineIconSize}" height="${inlineIconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </a>
      <a href="https://twsia.com" target="_blank" style="display: flex; align-items: center;">
        <img src="https://twsia.com/img/twsia-logo.png" alt="Tawsia" style="height: ${
          size === "s" ? "20px" : "24px"
        }; width: auto;" />
      </a>
    </div>
  </div>
  `
      : `
  <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 5px 16px; border: 1px solid ${
    colors.border
  }; border-radius: 8px; background: ${colors.bg}; font-size: 13px;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <span style="color: ${
          colors.textSecondary
        }; font-size: 10px;">إجمالي التوصيات</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${
            colors.star
          }" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span style="font-weight: 600; color: ${
            colors.text
          };">${totalReviews}</span>
        </div>
      </div>
      <div style="width: 1px; height: 32px; background: ${
        colors.border
      };"></div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <span style="color: ${
          colors.textSecondary
        }; font-size: 10px;">متوسط التقييم</span>
        <span style="font-weight: 600; color: ${
          colors.text
        };">${averageRating.toFixed(1)}/5</span>
      </div>
      <div style="width: 1px; height: 32px; background: ${
        colors.border
      };"></div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
        <span style="color: ${colors.textSecondary};">آخر</span>
        <span style="font-weight: 600; color: ${colors.text};">${
          company.reviews.length
        }</span>
        <span style="color: ${colors.textSecondary};">توصيات</span>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <a href="${companyUrl}" target="_blank" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; transition: all 0.3s; border: none; cursor: pointer;">
        <span>عرض المزيد</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </a>
      <a href="${companyUrl}/add-review" target="_blank" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; transition: all 0.3s; border: none; cursor: pointer;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span>اكتب مراجعة</span>
      </a>
      <a href="https://twsia.com" target="_blank" style="display: flex; align-items: center;">
        <img src="https://twsia.com/img/twsia-logo.png" alt="Tawsia" style="height: 28px; width: auto;" />
      </a>
    </div>
  </div>
  `;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      direction: rtl;
    }
  </style>
</head>
<body>
  ${
    company.reviews.length > 0
      ? summaryContent
      : `
  <div style="display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; border: 1px solid ${colors.border}; border-radius: 8px; background: ${colors.bg};">
    <p style="font-size: 14px; color: ${colors.textSecondary};">لا توجد مراجعات بعد</p>
  </div>
  `
  }
</body>
</html>
    `;
  }
}

function generateVerticalWidget(params: {
  company: any;
  size: "xl" | "l" | "m" | "s";
  theme: "light" | "dark";
  colors: any;
  totalReviews: number;
  averageRating: number;
  commentsCount: number;
  companyUrl: string;
}): string {
  const {
    company,
    size,
    theme,
    colors,
    totalReviews,
    averageRating,
    commentsCount,
    companyUrl,
  } = params;

  // For M size - vertical stacked layout
  if (size === "m") {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      direction: rtl;
      padding: 15px;
    }
  </style>
</head>
<body>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; border: 1px solid ${
    colors.border
  }; border-radius: 12px; background: ${
    colors.bg
  }; max-width: 300px; margin: 0 auto;">
    
    <!-- Row 1: Rating with link icon -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-weight: 700; font-size: 32px; color: ${
        colors.text
      };">${averageRating.toFixed(1)}/5</span>
      <a href="${companyUrl}" target="_blank" style="display: flex; align-items: center; color: #3b82f6;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    </div>
    
    <!-- Row 2: Stars -->
    <div style="display: flex; align-items: center; justify-content: center;">
      ${generateStars(averageRating, colors.star, 24)}
    </div>
    
    <!-- Row 3: Last X reviews -->
    <div style="font-size: 14px; color: ${colors.textSecondary};">
      آخر ${totalReviews} توصية
    </div>
    
    <!-- Row 4: Logo -->
    <a href="https://twsia.com" target="_blank" style="display: flex; align-items: center; margin-top: 5px;">
      <img src="https://twsia.com/img/twsia-logo.png" alt="Tawsia" style="height: 32px; width: auto;" />
    </a>
  </div>
</body>
</html>
    `;
  }

  // For S size - compact 2-column layout
  if (size === "s") {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      direction: rtl;
      padding: 10px;
    }
  </style>
</head>
<body>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; border: 1px solid ${
    colors.border
  }; border-radius: 10px; background: ${
    colors.bg
  }; max-width: 350px; margin: 0 auto;">
    
    <!-- Row 1, Col 1: Total comments with info icon -->
    <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
      <span style="font-weight: 600; font-size: 14px; color: ${
        colors.text
      };">إجمالي التعليقات: ${totalReviews}</span>
      <a href="${companyUrl}" target="_blank" style="display: flex; align-items: center; color: #3b82f6;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </a>
    </div>
    
    <!-- Row 1, Col 2: Average rating -->
    <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
      <span style="font-weight: 700; font-size: 18px; color: ${
        colors.text
      };">${averageRating.toFixed(1)}/5</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${
        colors.star
      }" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
    </div>
    
    <!-- Row 2, Col 1: Logo -->
    <div style="display: flex; align-items: center; justify-content: center;">
      <a href="https://twsia.com" target="_blank" style="display: flex; align-items: center;">
        <img src="https://twsia.com/img/twsia-logo.png" alt="Tawsia" style="height: 24px; width: auto;" />
      </a>
    </div>
    
    <!-- Row 2, Col 2: Last X comments -->
    <div style="display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 12px; color: ${
        colors.textSecondary
      };">آخر ${totalReviews} تعليق</span>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Limit reviews based on commentsCount
  const reviewsToShow = company.reviews.slice(0, commentsCount);

  // Generate review cards for vertical layout
  const reviewCardsHTML =
    reviewsToShow.length > 0
      ? reviewsToShow
          .map(
            (review: any) => `
      <a href="${companyUrl}" target="_blank" style="display: block; padding: 12px; border: 1px solid ${
        colors.border
      }; border-radius: 8px; background: ${colors.bg}; margin-bottom: 10px; text-decoration: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
          ${generateStars(review.rating, colors.star, 16)}
        </div>
        <p style="color: ${
          colors.text
        }; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 10px; word-break: break-word;">
          ${escapeHtml(truncateText(review.comment || "", 120))}
        </p>
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 8px; border-top: 1px solid ${
          colors.border
        };">
          <span style="font-size: 12px; font-weight: 600; color: ${
            colors.text
          };">
            ${escapeHtml(review.userName || review.user?.name || "مستخدم")}
          </span>
          <span style="font-size: 10px; color: ${colors.textSecondary};">
            ${formatDate(review.createdAt)}
          </span>
          ${
            review.isVerified
              ? `<span style="font-size: 10px; color: #3b82f6; display: flex; align-items: center; gap: 2px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                موثق
              </span>`
              : `<span style="font-size: 10px; color: #ef4444; display: flex; align-items: center; gap: 2px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                غير موثق
              </span>`
          }
        </div>
      </a>
    `,
          )
          .join("")
      : `<div style="text-align: center; padding: 20px; color: ${colors.textSecondary};">لا توجد مراجعات بعد</div>`;

  // Summary section for vertical layout
  const summaryHTML = `
    <div style="display: flex; justify-content: space-around; padding: 12px; border: 1px solid ${
      colors.border
    }; border-radius: 8px; background: ${colors.bg}; margin-bottom: 10px;">
      <div style="text-align: center;">
        <div style="font-size: 11px; color: ${
          colors.textSecondary
        }; margin-bottom: 4px;">إجمالي التوصيات</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${
            colors.star
          }" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span style="font-weight: 700; font-size: 18px; color: ${
            colors.text
          };">${totalReviews}</span>
        </div>
      </div>
      <div style="width: 1px; background: ${colors.border};"></div>
      <div style="text-align: center;">
        <div style="font-size: 11px; color: ${
          colors.textSecondary
        }; margin-bottom: 4px;">متوسط التقييم</div>
        <span style="font-weight: 700; font-size: 18px; color: ${
          colors.text
        };">${averageRating.toFixed(1)}/5</span>
      </div>
    </div>
  `;

  // Buttons section
  const buttonsHTML = `
    <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 10px;">
      <a href="https://twsia.com" target="_blank" style="display: flex; align-items: center;">
        <img src="https://twsia.com/img/twsia-logo.png" alt="Tawsia" style="height: 32px; width: auto;" />
      </a>
      <a href="${companyUrl}" target="_blank" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        عرض المزيد
      </a>
      <a href="${companyUrl}/add-review" target="_blank" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        اكتب مراجعة
      </a>
    </div>
  `;

  // Verification message
  const verificationMessage = `
    <div style="text-align: right; padding: 8px; font-size: 9px; color: ${colors.textSecondary}; line-height: 1.4;">
      يمكن التحقق من صحة الاتصال عبر نظام إدارة الأعمال، دون الحاجة إلى معلومات الاتصال الخاصة بشركة twsia من خلال التحقق من البيانات عبر البريد الإلكتروني أو الرسائل القصيرة.
    </div>
  `;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      direction: rtl;
      padding: 10px;
    }
    a[style*="display: block"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div style="max-width: 400px; margin: 0 auto;">
    ${reviewCardsHTML}
    ${summaryHTML}
    ${buttonsHTML}
    ${verificationMessage}
  </div>
</body>
</html>
  `;
}

function generateStars(
  rating: number,
  color: string,
  size: number = 16,
): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = "";

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>`;
  }

  // Half star
  if (hasHalfStar) {
    stars += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stop-color="${color}"/>
          <stop offset="50%" stop-color="#e5e7eb" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <path fill="url(#half)" d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>`;
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#e5e7eb" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>`;
  }

  return `<div style="display: flex; gap: 2px;">${stars}</div>`;
}

function truncateText(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`;
  return `منذ ${Math.floor(diffDays / 365)} سنوات`;
}
