import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import '../globals.css';
import Footer from '@/components/Footer';
import ScrollProgressIndicator from '@/components/ScrollProgressIndicator';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import CustomCursor from '@/components/CustomCursor';
import Preloader from '../../components/Preloader';
import StickyEmail from '../_components/StickyEmail';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';

export default function PortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <GoogleAnalytics gaId="G-MHLY1LNGY5" />
            <Script id="hotjar" strategy="afterInteractive">
                {`(function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6380611,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
            </Script>
            <ReactLenis
                root
                options={{
                    lerp: 0.1,
                    duration: 1.4,
                }}
            >
                <Navbar />
                <main>{children}</main>
                <Footer />
                <CustomCursor />
                <Preloader />
                <ScrollProgressIndicator />
                <ParticleBackground />
                <StickyEmail />
                <ThemeSwitcher />
            </ReactLenis>
        </>
    );
}
