'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/community', label: 'Community' },
  { href: '/support', label: 'Support' },
  { href: '/help', label: 'Help' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="relative z-10 w-full py-2 backdrop-blur-lg">
      <div className="container mx-auto flex max-w-7xl items-center justify-center px-4">
        <a href="/">
          <Image
            src="https://drive.google.com/uc?export=view&id=1dAaKjH8Gtc7DVXRj_foxzdc5gOnjp6cU"
            alt="EduSlide Logo"
            width={300}
            height={64}
            className="h-16 w-auto cursor-pointer md:h-[5.5rem]"
            priority
          />
        </a>
        <nav className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
