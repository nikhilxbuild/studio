'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Users, Heart, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/support', label: 'Support', icon: Heart },
  { href: '/', label: 'Home', icon: Home },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 block w-[calc(100%-12px)] max-w-sm -translate-x-1/2 rounded-full border border-white/10 bg-[rgba(20,20,30,0.6)] backdrop-blur-lg md:hidden">
      <div className="grid h-16 grid-cols-5 items-center justify-center gap-1 p-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'group flex h-[56px] w-full flex-col items-center justify-center rounded-full text-center text-[11px] font-medium transition-all duration-300',
              pathname === link.href
                ? 'bg-gradient-to-t from-primary/20 to-primary/5 text-primary shadow-[0_0_15px_-5px_hsl(var(--primary))]'
                : 'text-muted-foreground hover:bg-white/10'
            )}
          >
            <link.icon className="h-5 w-5" />
            <span className="mt-1 leading-tight">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
