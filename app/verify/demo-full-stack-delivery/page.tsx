import Link from 'next/link';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function DemoCertificateVerification() {
    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="container max-w-2xl">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to portfolio</Link>
                <div className="mt-16 bg-card border border-border rounded-xl p-8 sm:p-12">
                    <div className="flex items-center gap-3 text-primary">
                        <CheckCircle2 size={28} />
                        <span className="font-semibold uppercase tracking-wider text-sm">Certificate verified</span>
                    </div>
                    <div className="mt-10 flex items-start gap-4">
                        <ShieldCheck className="text-primary shrink-0" size={38} />
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-anton leading-none">Demo Full Stack Delivery Certificate</h1>
                            <p className="mt-4 text-muted-foreground">Issued by Portfolio Labs · 2026</p>
                        </div>
                    </div>
                    <p className="mt-10 border-t border-border pt-6 text-muted-foreground leading-relaxed">This verification page confirms that the certificate shown on this portfolio was issued by Portfolio Labs for successful full-stack product delivery.</p>
                </div>
            </div>
        </main>
    );
}
