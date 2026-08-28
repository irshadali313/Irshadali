'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import { IProject } from '@/types';
import {
    IGeneralInfo,
    ISocialLink,
    IMyStack,
    IExperience,
    IBannerStats,
    IAboutMe,
    ICertificate,
    defaultGeneralInfo,
    defaultSocialLinks,
    defaultMyStack,
    defaultMyExperience,
    defaultBannerStats,
    defaultAboutMe,
    defaultCertificates,
    defaultProjects,
} from './adminData';

interface PortfolioContextValue {
    generalInfo: IGeneralInfo;
    socialLinks: ISocialLink[];
    myStack: IMyStack;
    myExperience: IExperience[];
    projects: IProject[];
    bannerStats: IBannerStats;
    aboutMe: IAboutMe;
    certificates: ICertificate[];
    refresh: () => void;
    loading: boolean;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);
const PORTFOLIO_UPDATED_EVENT = 'portfolio-data-updated';

export function notifyPortfolioUpdated() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
    window.localStorage.setItem(PORTFOLIO_UPDATED_EVENT, Date.now().toString());
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
    const [generalInfo, setGeneralInfo] = useState<IGeneralInfo>(defaultGeneralInfo);
    const [socialLinks, setSocialLinks] = useState<ISocialLink[]>(defaultSocialLinks);
    const [myStack, setMyStack] = useState<IMyStack>(defaultMyStack);
    const [myExperience, setMyExperience] = useState<IExperience[]>(defaultMyExperience);
    const [projects, setProjects] = useState<IProject[]>(defaultProjects);
    const [bannerStats, setBannerStats] = useState<IBannerStats>(defaultBannerStats);
    const [aboutMe, setAboutMe] = useState<IAboutMe>(defaultAboutMe);
    const [certificates, setCertificates] = useState<ICertificate[]>(defaultCertificates);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/portfolio/data', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch portfolio data');
            const data = await res.json();

            if (data.generalInfo) setGeneralInfo(data.generalInfo);
            if (data.socialLinks) setSocialLinks(data.socialLinks);
            if (data.myStack) setMyStack(data.myStack);
            if (data.myExperience) setMyExperience(data.myExperience);
            if (data.projects) setProjects(data.projects);
            if (data.bannerStats) setBannerStats(data.bannerStats);
            if (data.aboutMe) setAboutMe(data.aboutMe);
            if (data.certificates) setCertificates(data.certificates);
        } catch (err) {
            console.error('Failed to load portfolio data from DB, using defaults:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        const handleUpdate = () => refresh();
        window.addEventListener(PORTFOLIO_UPDATED_EVENT, handleUpdate);
        window.addEventListener('storage', handleUpdate);
        return () => {
            window.removeEventListener(PORTFOLIO_UPDATED_EVENT, handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [refresh]);

    // Update the document title based on the provided name
    useEffect(() => {
        if (generalInfo.fullName) {
            document.title = `Portfolio - ${generalInfo.fullName}`;
        }
    }, [generalInfo.fullName]);

    return (
        <PortfolioContext.Provider
            value={{
                generalInfo,
                socialLinks,
                myStack,
                myExperience,
                projects,
                bannerStats,
                aboutMe,
                certificates,
                refresh,
                loading,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    );
}

export function usePortfolio(): PortfolioContextValue {
    const ctx = useContext(PortfolioContext);
    if (!ctx) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return ctx;
}
