import type { Metadata } from 'next';
import { Anton, Manrope, Roboto_Flex } from 'next/font/google';
import { PortfolioProvider } from '@/lib/portfolioContext';

export const metadata: Metadata = {
    title: 'Portfolio',
    description: 'Personal portfolio',
};

const antonFont = Anton({
    weight: '400',
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-anton',
});

const robotoFlex = Roboto_Flex({
    weight: ['100', '400', '500', '600', '700', '800'],
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-roboto-flex',
});

const manrope = Manrope({
    weight: ['400', '500', '600', '700', '800'],
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-manrope',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${antonFont.variable} ${robotoFlex.variable} ${manrope.variable} antialiased`}
            >
                <PortfolioProvider>{children}</PortfolioProvider>
            </body>
        </html>
    );
}
