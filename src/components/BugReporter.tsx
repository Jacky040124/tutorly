'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { send } from '@/app/[locale]/action';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function BugReporter() {
    const t = useTranslations('BugReport');
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setStatus('idle');
        
        try {
            await send({
                to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
                content: `
                    <h2>New Feedback Received</h2>
                    <p><strong>From:</strong> ${email}</p>
                    <p>${message}</p>
                `,
                type: "feedbackConfirmation"
            });

            setStatus('success');
            setMessage('');
            setEmail('');
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
            }, 2000);
        } catch (error) {
            setStatus('error');
        }
        
        setIsSending(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <Card className="w-80">
                    <CardHeader className="relative pb-2">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => setIsOpen(false)}
                        >
                            ×
                        </Button>
                        <h3 className="font-semibold">{t('title')}</h3>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('emailPlaceholder')}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">{t('subtitle')}</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t('placeholder')}
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>
                            {status === 'success' && (
                                <p className="text-green-500 text-sm mt-2">{t('success')}</p>
                            )}
                            {status === 'error' && (
                                <p className="text-red-500 text-sm mt-2">{t('error')}</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={isSending}
                            >
                                {isSending ? t('sending') : t('sendButton')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="icon"
                    className="rounded-full h-12 w-12"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
} 