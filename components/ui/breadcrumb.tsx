"use client";

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn('w-full max-w-full overflow-x-auto pb-2 md:overflow-visible md:pb-0', className)}
    {...props}
  />
));
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, children, ...props }, ref) => {
  const [isExpandedMobile, setIsExpandedMobile] = React.useState(false);
  const [shouldCollapseMobile, setShouldCollapseMobile] = React.useState(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const listRef = React.useRef<HTMLOListElement | null>(null);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const updateViewport = () => {
      const mobile = mediaQuery.matches;
      setIsMobileViewport(mobile);

      if (!mobile) {
        setIsExpandedMobile(false);
      }
    };

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  const applyCollapsedVisibility = React.useCallback(() => {
    const node = listRef.current;
    if (!node) return;

    const directChildren = Array.from(
      node.querySelectorAll(':scope > li:not([data-breadcrumb-ellipsis="true"])')
    ) as HTMLLIElement[];

    if (!isMobileViewport || directChildren.length <= 5 || isExpandedMobile) {
      directChildren.forEach((child) => {
        child.style.display = '';
      });
      return;
    }

    const keepFromIndex = directChildren.length - 5;
    directChildren.forEach((child, index) => {
      child.style.display = index < keepFromIndex ? 'none' : '';
    });
  }, [isExpandedMobile, isMobileViewport]);

  React.useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const updateCollapseState = () => {
      const directChildrenCount = node.querySelectorAll(':scope > li:not([data-breadcrumb-ellipsis="true"])').length;
      setShouldCollapseMobile(isMobileViewport && directChildrenCount > 5);
      applyCollapsedVisibility();
    };

    updateCollapseState();

    const observer = new MutationObserver(updateCollapseState);
    observer.observe(node, { childList: true });

    return () => observer.disconnect();
  }, [children, applyCollapsedVisibility, isMobileViewport]);

  React.useEffect(() => {
    applyCollapsedVisibility();
  }, [applyCollapsedVisibility]);

  const setRefs = (node: HTMLOListElement | null) => {
    listRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
      return;
    }

    if (ref) {
      ref.current = node;
    }
  };

  return (
    <ol
      ref={setRefs}
      className={cn(
        'flex min-w-max flex-nowrap items-center gap-1 whitespace-nowrap text-sm text-muted-foreground sm:gap-1.5 md:min-w-0 md:flex-wrap md:whitespace-normal',
        className
      )}
      {...props}
    >
      {shouldCollapseMobile && !isExpandedMobile && (
        <li data-breadcrumb-ellipsis="true" className="inline-flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            className="transition-colors hover:text-foreground"
            onClick={() => setIsExpandedMobile(true)}
            aria-label="عرض مسار التنقل كاملاً"
          >
            ...
          </button>
        </li>
      )}
      {children}
    </ol>
  );
});
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:size-[18px]', className)}
    {...props}
  >
    {children ?? <ChevronRight width={18} height={18} />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
