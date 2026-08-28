'use client';
import SectionTitle from '@/components/SectionTitle';
import { usePortfolio } from '@/lib/portfolioContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { X, ExternalLink, Maximize2 } from 'lucide-react';
import { ICertificate, getDirectImageUrl } from '@/lib/adminData';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Certificates = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { certificates } = usePortfolio();
    const [selectedCert, setSelectedCert] = useState<ICertificate | null>(null);

    useGSAP(
        () => {
            const slideUpEl = containerRef.current?.querySelectorAll('.cert-slide-up');
            if (!slideUpEl?.length) return;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                    end: 'bottom 80%',
                    scrub: 0.5,
                },
            });

            tl.from('.cert-slide-up', {
                opacity: 0,
                y: 40,
                ease: 'none',
                stagger: 0.2,
            });
        },
        { scope: containerRef, dependencies: [certificates] },
    );

    if (!certificates || certificates.length === 0) return null;

    return (
        <section id="certificates" ref={containerRef} className="py-20 relative">
            <div className="container">
                <SectionTitle title="Certifications" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {certificates.map((cert) => (
                        <div
                            key={cert.id}
                            className="cert-slide-up group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
                        >
                            <div 
                                className="relative h-48 w-full bg-background-light overflow-hidden cursor-pointer group/img"
                                onClick={() => setSelectedCert(cert)}
                            >
                                {cert.image ? (
                                    <>
                                        <img
                                            src={getDirectImageUrl(cert.image)}
                                            alt={cert.title}
                                            className="object-cover w-full h-full group-hover/img:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                            <Maximize2 className="text-white drop-shadow-md" size={32} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-roboto-flex text-foreground leading-tight">
                                        {cert.title}
                                    </h3>
                                    <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                        {cert.date}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">{cert.issuer}</p>
                                
                                {cert.url && (
                                    <Link
                                        href={cert.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-6 text-sm font-semibold text-primary hover:underline flex items-center gap-1 w-max"
                                    >
                                        Verify Credential <ExternalLink size={14} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Screen Modal */}
            {selectedCert && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/35 backdrop-blur-sm transition-opacity" 
                    onClick={() => setSelectedCert(null)}
                >
                    <div 
                        className="relative max-w-5xl w-full max-h-[95vh] flex flex-col items-center" 
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedCert(null)} 
                            className="absolute -top-12 right-0 text-foreground hover:text-primary transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={32} />
                        </button>
                        
                        {selectedCert.image && (
                            <div className="relative w-full aspect-[4/3] md:aspect-video bg-background rounded-lg overflow-hidden border border-border/50">
                                <img 
                                    src={getDirectImageUrl(selectedCert.image)} 
                                    alt={selectedCert.title} 
                                    className="w-full h-full object-contain" 
                                />
                            </div>
                        )}
                        
                        <div className="mt-6 flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold text-foreground mb-2">{selectedCert.title}</h3>
                            <p className="text-muted-foreground">{selectedCert.issuer} • {selectedCert.date}</p>
                            
                            {selectedCert.url && (
                                <a 
                                    href={selectedCert.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="mt-5 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <ExternalLink size={18} /> Verify Credential
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Certificates;
