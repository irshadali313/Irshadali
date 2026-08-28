'use client';
import { GitFork, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePortfolio } from '@/lib/portfolioContext';

interface RepoStats {
    stargazers_count: number;
    forks_count: number;
}

const Footer = () => {
    const { generalInfo } = usePortfolio();
    const [stats, setStats] = useState<RepoStats>({ stargazers_count: 0, forks_count: 0 });

    useEffect(() => {
        fetch('https://api.github.com/repos/irshadali313/portfolio-2.0')
            .then((res) => res.json())
            .then((data) => {
                if (data.stargazers_count !== undefined) {
                    setStats({
                        stargazers_count: data.stargazers_count,
                        forks_count: data.forks_count,
                    });
                }
            })
            .catch(console.error);
    }, []);

    return (
        <footer className="text-center pb-5" id="contact">
            <div className="container">
                <p className="text-lg">Have a project in mind?</p>
                <a
                    href={`mailto:${generalInfo.email}`}
                    className="text-3xl sm:text-4xl font-anton inline-block mt-5 mb-10 hover:underline"
                >
                    {generalInfo.email}
                </a>

                <div className="">
                    <a
                        href="https://github.com/irshadali313"
                        target="_blank"
                        className="leading-none text-muted-foreground hover:underline hover:text-foreground"
                        rel="noreferrer"
                    >
                        Design & built by {generalInfo.fullName}
                        <div className="flex items-center justify-center gap-5 pt-1">
                            <span className="flex items-center gap-2">
                                <Star size={18} /> {stats.stargazers_count}
                            </span>
                            <span className="flex items-center gap-2">
                                <GitFork size={18} /> {stats.forks_count}
                            </span>
                        </div>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
