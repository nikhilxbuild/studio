'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/community', label: 'Community' },
  { href: '/support', label: 'Support' },
  { href: '/help', label: 'Help' },
];

export function Header() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY && window.scrollY > 80) { // if scroll down
        setIsHidden(true);
      } else { // if scroll up
        setIsHidden(false);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);


  return (
    <header className={cn(
        "fixed top-0 z-50 w-full bg-background/50 backdrop-blur-lg transition-transform duration-300",
        isHidden && "-translate-y-full"
      )}>
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-center px-4 relative">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2">
            <Layers className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">EduSlide</h1>
          </a>
        </div>
        <nav className="hidden absolute right-4 items-center space-x-6 text-sm font-medium md:flex">
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
