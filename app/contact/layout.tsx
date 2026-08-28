import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import Preloader from '@/components/Preloader';
import ScrollProgressIndicator from '@/components/ScrollProgressIndicator';
import ParticleBackground from '@/components/ParticleBackground';

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
            <CustomCursor />
            <Preloader />
            <ScrollProgressIndicator />
            <ParticleBackground />
        </>
    );
}
