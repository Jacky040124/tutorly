import Link from 'next/link'
import { Button } from '@/components/Button'

export function BackToHomeButton() {
    return(
        <div className="absolute top-4 left-4">
            <Link href="/" aria-label="Home">
                <Button variant="outline" color="slate">
                    ← Back to home
                </Button>
            </Link>
    </div>
    )
}