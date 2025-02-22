'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { send, uploadImage } from '@/app/[locale]/action';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { MessageCircle, Image as ImageIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function BugReporter() {
    const t = useTranslations('BugReport');
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [steps, setSteps] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await uploadImage(file, "bug-reports", "bugs");
            setImageUrl(result.downloadUrl);
        } catch (error) {
            setStatus('error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setStatus('idle');
        
        try {
            await send({
                to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
                content: [
                    `<h2>New Feedback Received</h2>`,
                    `<p><strong>From:</strong> ${email}</p>`,
                    `<p><strong>Location & Steps to Reproduce:</strong></p>`,
                    `<p>${steps}</p>`,
                    `<p><strong>Description:</strong></p>`,
                    `<p>${message}</p>`,
                    imageUrl ? `<p><strong>Screenshot URL:</strong> ${imageUrl}</p>` : ''
                ].filter(Boolean).join(''),
                type: "feedbackConfirmation"
            });

            setStatus('success');
            setMessage('');
            setEmail('');
            setSteps('');
            setImageUrl(null);
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
                                <Label htmlFor="steps">{t('steps')}</Label>
                                <Textarea
                                    id="steps"
                                    value={steps}
                                    onChange={(e) => setSteps(e.target.value)}
                                    placeholder={t('stepsPlaceholder')}
                                    className="min-h-[80px]"
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
                            <div className="space-y-2">
                                <Label>{t('screenshot')}</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        {t('uploadImage')}
                                    </Button>
                                    {imageUrl && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setImageUrl(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                {imageUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={imageUrl}
                                            alt="Screenshot"
                                            className="max-h-32 rounded-md"
                                        />
                                    </div>
                                )}
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