import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { MainNav } from '@/components/main-nav';
import StoreSwitcher from '@/components/store-switcher';
import { ModeToggle } from '@/components/theme-toggle';
import prismadb from '@/lib/prismadb';

const Navbar = async () => {
  // Get auth status early to fail fast
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Use a more specific query with select to only get needed fields
  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <nav
      className="border-b"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 items-center px-4">
        <Suspense fallback={<div className="h-10 w-[200px] animate-pulse bg-gray-200" />}>
          <StoreSwitcher items={stores} />
        </Suspense>
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
