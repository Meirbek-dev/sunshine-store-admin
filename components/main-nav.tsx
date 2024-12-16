'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function MainNav({ className, ...properties }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const parameters = useParams();

  const routes = [
    {
      href: `/${parameters.storeId}`,
      label: 'Обзор',
      active: pathname === `/${parameters.storeId}`,
    },
    {
      href: `/${parameters.storeId}/billboards`,
      label: 'Билборды',
      active: pathname === `/${parameters.storeId}/billboards`,
    },
    {
      href: `/${parameters.storeId}/categories`,
      label: 'Категории',
      active: pathname === `/${parameters.storeId}/categories`,
    },
    {
      href: `/${parameters.storeId}/sizes`,
      label: 'Размеры',
      active: pathname === `/${parameters.storeId}/sizes`,
    },
    {
      href: `/${parameters.storeId}/colors`,
      label: 'Цвета',
      active: pathname === `/${parameters.storeId}/colors`,
    },
    {
      href: `/${parameters.storeId}/products`,
      label: 'Товары',
      active: pathname === `/${parameters.storeId}/products`,
    },
    {
      href: `/${parameters.storeId}/orders`,
      label: 'Заказы',
      active: pathname === `/${parameters.storeId}/orders`,
    },
    {
      href: `/${parameters.storeId}/settings`,
      label: 'Настройки',
      active: pathname === `/${parameters.storeId}/settings`,
    },
  ];

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...properties}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-black dark:text-white' : 'text-muted-foreground',
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
