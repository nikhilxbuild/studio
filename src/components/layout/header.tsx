'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    <header className={cn(
        "fixed top-0 z-50 w-full bg-transparent"
    )}>
      <div className="container relative mx-auto flex h-16 max-w-7xl items-center justify-center px-4">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/eduslide-logo.png"
              alt="EduSlide Logo"
              width={225}
              height={48}
              className="h-10 w-auto md:h-12"
              priority
            />
          </Link>
        </div>
        <nav className="absolute right-4 hidden items-center space-x-6 text-sm font-medium md:flex">
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
