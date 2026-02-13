'use client';

import Link from 'next/link';
import { Twitter, Instagram, Youtube, Send } from 'lucide-react';
import type { ComponentProps } from 'react';

const DiscordIcon = (props: ComponentProps<'svg'>) => (
    <svg role="img" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8852-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.6109 1.233-1.8442-.2762-3.68-.2762-5.4868 0-.1645-.4073-.3999-.8578-.6109-1.233a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8852 1.5152.069.069 0 00-.0321.0232c-1.8442 3.159-2.9231 6.6192-3.4604 10.1501a.0741.0741 0 00.004.0452.0772.0772 0 00.0628.0413h.004c.1488-.0413.2937-.0826.4386-.1239a12.6377 12.6377 0 001.2278-2.3129.0741.0741 0 00-.0413-.1017c-.183-.0628-.3619-.13-.5409-.2013a.0741.0741 0 00-.0546.015c-.09.067-.1759.1381-.2658.2132a.0741.0741 0 00-.015.0628c2.0221 4.5828 6.4429 7.6399 11.4828 7.6399s9.4607-3.0571 11.4828-7.6399a.0741.0741 0 00-.015-.0628c-.0899-.0751-.1759-.1462-.2658-.2132a.0741.0741 0 00-.0546-.015c-.179.0713-.3579.1385-.5409.2013a.0741.0741 0 00-.0413.1017c.3619.7135.7963 1.427 1.2278 2.3129.1449.0413.2898.0826.4386.1239h.004a.0772.0772 0 00.0628-.0413.0741.0741 0 00.004-.0452c-.5373-3.5309-1.6162-6.9911-3.4604-10.1501a.069.069 0 00-.0321-.0232zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332 1.002-2.419 2.1569-2.419 1.1497 0 2.1292 1.0858 2.1292 2.419 0 1.3333-.9795 2.419-2.1292 2.419zm7.9528 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332 1.002-2.419 2.1569-2.419 1.1497 0 2.1292 1.0858 2.1292 2.419 0 1.3333-.9795 2.419-2.1292 2.419z"/>
    </svg>
);

const socialLinks = [
  { href: 'https://x.com/EduSlideAi', icon: Twitter, label: 'Twitter' },
  { href: 'https://www.instagram.com/eduslide.in', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/@EduslideAi', icon: Youtube, label: 'YouTube' },
  { href: 'https://t.me/EduSlide', icon: Send, label: 'Telegram' },
  { href: 'https://discord.gg/ggtSC7umq', icon: DiscordIcon, label: 'Discord' },
];

const footerLinks = [
    { href: '/about', label: 'About' },
    { href: '/community', label: 'Community' },
    { href: '/support', label: 'Support' },
    { href: '/help', label: 'Help' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
];

export function Footer() {
  return (
    <footer className="w-full bg-transparent z-10">
      <div className="container mx-auto max-w-7xl px-4 py-4 md:py-6">
        <div className="flex flex-col items-center gap-4 text-center">
            
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                {footerLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                    <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
                        <social.icon className="h-5 w-5" />
                        <span className="sr-only">{social.label}</span>
                    </a>
                ))}
            </div>

            <p className="text-sm text-muted-foreground">
                © 2026 EduSlide. Made with ❤️ for Students.
            </p>
        </div>
      </div>
    </footer>
  );
}
