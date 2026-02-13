import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Twitter, Instagram, Youtube, Send, Zap, MessageSquare, Star } from 'lucide-react';
import type { ComponentProps } from 'react';

// Using an inline SVG for the brand-accurate Discord icon
const DiscordIcon = (props: ComponentProps<'svg'>) => (
  <svg role="img" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8852-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.6109 1.233-1.8442-.2762-3.68-.2762-5.4868 0-.1645-.4073-.3999-.8578-.6109-1.233a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8852 1.5152.069.069 0 00-.0321.0232c-1.8442 3.159-2.9231 6.6192-3.4604 10.1501a.0741.0741 0 00.004.0452.0772.0772 0 00.0628.0413h.004c.1488-.0413.2937-.0826.4386-.1239a12.6377 12.6377 0 001.2278-2.3129.0741.0741 0 00-.0413-.1017c-.183-.0628-.3619-.13-.5409-.2013a.0741.0741 0 00-.0546.015c-.09.067-.1759.1381-.2658.2132a.0741.0741 0 00-.015.0628c2.0221 4.5828 6.4429 7.6399 11.4828 7.6399s9.4607-3.0571 11.4828-7.6399a.0741.0741 0 00-.015-.0628c-.0899-.0751-.1759-.1462-.2658-.2132a.0741.0741 0 00-.0546-.015c-.179.0713-.3579.1385-.5409.2013a.0741.0741 0 00-.0413.1017c.3619.7135.7963 1.427 1.2278 2.3129.1449.0413.2898.0826.4386.1239h.004a.0772.0772 0 00.0628-.0413.0741.0741 0 00.004-.0452c-.5373-3.5309-1.6162-6.9911-3.4604-10.1501a.069.069 0 00-.0321-.0232zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332 1.002-2.419 2.1569-2.419 1.1497 0 2.1292 1.0858 2.1292 2.419 0 1.3333-.9795 2.419-2.1292 2.419zm7.9528 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332 1.002-2.419 2.1569-2.419 1.1497 0 2.1292 1.0858 2.1292 2.419 0 1.3333-.9795 2.419-2.1292 2.419z"/>
  </svg>
);


const socialPlatforms = [
    { name: 'Discord', href: 'https://discord.gg/ggtSC7umq', icon: DiscordIcon, description: "Join live discussions & get help." },
    { name: 'Telegram', href: 'https://t.me/EduSlide', icon: Send, description: "Get instant updates & announcements." },
    { name: 'Twitter/X', href: 'https://x.com/EduSlideAi', icon: Twitter, description: "Follow us for quick tips & news." },
    { name: 'Instagram', href: 'https://www.instagram.com/eduslide.in', icon: Instagram, description: "See behind-the-scenes content." },
    { name: 'YouTube', href: 'https://youtube.com/@EduslideAi', icon: Youtube, description: "Watch tutorials and feature demos." },
];

const whyJoin = [
    { icon: Star, text: "Early access to new features" },
    { icon: Zap, text: "Productivity and study tips" },
    { icon: MessageSquare, text: "Direct support from the team" },
];

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 md:py-20">
        <div className="space-y-16">
            <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Join Our Community</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Connect with thousands of students and teachers who use EduSlide to improve their study workflow.
            </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {socialPlatforms.map((platform) => (
                <Link key={platform.name} href={platform.href} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="glassmorphic h-full transform transition-all duration-300 hover:-translate-y-2 glow-on-hover">
                    <CardHeader className="flex-row items-center gap-4">
                    <platform.icon className="h-8 w-8 text-primary" />
                    <CardTitle>{platform.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="text-muted-foreground">{platform.description}</p>
                    </CardContent>
                </Card>
                </Link>
            ))}
            </div>

            <Card className="glassmorphic">
                <CardHeader>
                    <CardTitle className="text-center">Why Join?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
                        {whyJoin.map((item) => (
                            <div key={item.text} className="flex flex-col items-center">
                                <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <p className="font-semibold">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
