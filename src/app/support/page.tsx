import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Server, Zap, Rocket, HandCoins, Heart } from 'lucide-react';

const whySupport = [
    { icon: Server, text: "Server Maintenance" },
    { icon: Rocket, text: "New Feature Development" },
    { icon: Zap, text: "Faster Processing Speeds" },
    { icon: Heart, text: "Keeping EduSlide Free for All" },
    { icon: HandCoins, text: "Future AI Improvements" },
];

export default function SupportPage() {
  return (
    <div className="w-full animated-gradient-background">
        <div className="relative z-10">
            <div className="container mx-auto max-w-4xl py-12 px-4 md:py-20">
                <div className="space-y-12 text-center">
                    <div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Support EduSlide</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        EduSlide is a free platform built for students. Your support helps us maintain and improve our services for everyone.
                    </p>
                    </div>

                    <Card className="glassmorphic max-w-sm mx-auto">
                    <CardHeader>
                        <CardTitle>Donate via UPI</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-2 bg-white rounded-lg">
                            <Image 
                                src="https://placehold.co/250x250/0B0F1A/FFF?text=UPI\nQR" 
                                alt="UPI QR Code"
                                width={250}
                                height={250}
                                className="rounded-md"
                            />
                        </div>
                        <Button size="lg" className="w-full">
                        Pay with UPI App
                        </Button>
                    </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Why Your Support Matters</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-3xl mx-auto">
                            {whySupport.map((item) => (
                                <div key={item.text} className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Another way to help</h2>
                        <p className="text-muted-foreground">Sharing EduSlide with your friends and on social media helps us grow!</p>
                        <Button variant="outline" size="lg">Share EduSlide</Button>
                    </div>

                    <div className="pt-8">
                        <h3 className="text-3xl font-bold text-primary">Thank You!</h3>
                        <p className="mt-2 text-muted-foreground">Your generosity and support mean the world to us.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
