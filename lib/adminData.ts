/**
 * adminData.ts
 *
 * Contains:
 *  - TypeScript interfaces for all portfolio data types
 *  - Default values (used as initial state before API responds & for seeding)
 *  - Helper utilities (getDirectImageUrl)
 *
 * NOTE: localStorage functions have been removed.
 * All persistence is now handled via MongoDB through the API routes in /api/portfolio/.
 */

import { IProject } from '@/types';
import { SEED_DATA } from './seedData';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface IGeneralInfo {
    email: string;
    emailSubject: string;
    emailBody: string;
    oldPortfolio: string;
    upworkProfile: string;
    developerTitle: string;
    firstName: string;
    fullName: string;
}

export interface ISocialLink {
    name: string;
    url: string;
}

export interface IStackItem {
    name: string;
    icon: string;
}

export interface IMyStack {
    frontend: IStackItem[];
    backend: IStackItem[];
    database: IStackItem[];
    tools: IStackItem[];
    [key: string]: IStackItem[];
}

export interface IExperience {
    title: string;
    company: string;
    duration: string;
}

export interface IBannerStats {
    yearsExperience: string;
    completedProjects: string;
    hoursWorked: string;
    availableStatus: string;
}

export interface IAboutMe {
    headline: string;
    bio1: string;
    bio2: string;
}

export interface ICertificate {
    id: string;
    title: string;
    issuer: string;
    date: string;
    image: string;
    url?: string;
}

// ── Default Values (used for initial render before API responds) ──────────────

// export const defaultGeneralInfo: IGeneralInfo = SEED_DATA.generalInfo;

export const defaultSocialLinks: ISocialLink[] = SEED_DATA.socialLinks;

export const defaultMyStack: IMyStack = SEED_DATA.myStack as IMyStack;

export const defaultMyExperience: IExperience[] = SEED_DATA.myExperience;

export const defaultProjects: IProject[] = SEED_DATA.projects as IProject[];

export const defaultBannerStats: IBannerStats = SEED_DATA.bannerStats;

export const defaultAboutMe: IAboutMe = SEED_DATA.aboutMe;

export const defaultCertificates: ICertificate[] = SEED_DATA.certificates;

// ── Helper: resolve Google Drive / direct image URLs ─────────────────────────

export function getDirectImageUrl(url: string | undefined): string {
    if (!url) return '';

    // Google Drive: /file/d/ID
    const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // Google Drive: open?id=ID
    const driveOpenRegex = /drive\.google\.com\/open\?id=([^&]+)/;
    const matchOpen = url.match(driveOpenRegex);
    if (matchOpen && matchOpen[1]) {
        return `https://drive.google.com/uc?export=view&id=${matchOpen[1]}`;
    }

    return url;
}
