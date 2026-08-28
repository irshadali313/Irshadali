'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, Send } from 'lucide-react';
import Link from 'next/link';

const projectTypes = ['Static website', 'Dynamic web app', 'E-commerce', 'Custom product', 'Not sure'];
const budgets = ['Under ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000+'];

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSending(true);
        setError('');
        const form = new FormData(event.currentTarget);
        const payload = Object.fromEntries(form.entries());
        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error();
            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again or email directly.');
        } finally {
            setSending(false);
        }
    }

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="container">
                <div className="max-w-3xl mb-16">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to portfolio</Link>
                    <p className="mt-12 text-sm uppercase tracking-[0.25em] text-primary">Start a conversation</p>
                    <h1 className="mt-5 text-6xl sm:text-8xl font-anton leading-[.9]">Let&apos;s build<br /><span className="text-primary">what&apos;s next.</span></h1>
                    <p className="mt-8 max-w-xl text-lg text-muted-foreground">Tell me what your business needs. I&apos;ll turn the brief into a clear technical direction, realistic timeline, and product your customers can use.</p>
                </div>

                {submitted ? (
                    <div className="max-w-2xl bg-card border border-border p-8 sm:p-12 rounded-xl">
                        <CheckCircle2 className="text-primary" size={42} />
                        <h2 className="mt-6 text-4xl font-anton">Brief received.</h2>
                        <p className="mt-4 text-muted-foreground">Thanks for the context. I&apos;ll review your requirements and get back to you shortly.</p>
                        <Link href="/" className="inline-flex items-center gap-2 mt-8 text-primary font-semibold hover:underline">Return home <ArrowRight size={16} /></Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="max-w-4xl grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
                        <div className="space-y-8">
                            <div><label htmlFor="name" className="block text-sm font-semibold mb-2">Your name *</label><input required id="name" name="name" className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:border-primary" placeholder="Jane Smith" /></div>
                            <div><label htmlFor="email" className="block text-sm font-semibold mb-2">Work email *</label><input required type="email" id="email" name="email" className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:border-primary" placeholder="jane@company.com" /></div>
                            <div><label htmlFor="company" className="block text-sm font-semibold mb-2">Company</label><input id="company" name="company" className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:border-primary" placeholder="Company name" /></div>
                            <div><label htmlFor="projectType" className="block text-sm font-semibold mb-2">What are you building? *</label><select required id="projectType" name="projectType" className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:border-primary"><option value="">Select a direction</option>{projectTypes.map((item) => <option key={item}>{item}</option>)}</select></div>
                            <div><label htmlFor="budget" className="block text-sm font-semibold mb-2">Investment range *</label><select required id="budget" name="budget" className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:border-primary"><option value="">Select a range</option>{budgets.map((item) => <option key={item}>{item}</option>)}</select></div>
                        </div>
                        <div className="space-y-8">
                            <div><label htmlFor="timeline" className="block text-sm font-semibold mb-2">Desired timeline *</label><input required id="timeline" name="timeline" className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:border-primary" placeholder="e.g. Launch in 8-10 weeks" /></div>
                            <div><label htmlFor="details" className="block text-sm font-semibold mb-2">Project details *</label><textarea required id="details" name="details" rows={9} className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:border-primary resize-y" placeholder="What problem should the product solve? Include links, must-have features, or anything useful."></textarea></div>
                            <div className="hidden"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
                            {error && <p className="text-destructive text-sm">{error}</p>}
                            <button disabled={sending} className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-7 py-4 rounded-md font-semibold uppercase tracking-wider disabled:opacity-60"><Send size={17} />{sending ? 'Sending...' : 'Send project brief'}<ArrowRight className="group-hover:translate-x-1 transition-transform" size={17} /></button>
                            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Mail size={15} /> Prefer email? <a className="text-primary hover:underline" href="mailto:tasmirolislam@gmail.com">tasmirolislam@gmail.com</a></p>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}