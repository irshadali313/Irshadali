'use client';

import { notFound } from 'next/navigation';
import ProjectDetails from './_components/ProjectDetails';
import { usePortfolio } from '@/lib/portfolioContext';
import { use, useEffect, useState } from 'react';
import { IProject } from '@/types';

const Page = ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = use(params);
    const { projects } = usePortfolio();
    const [project, setProject] = useState<IProject | null | undefined>(undefined);

    useEffect(() => {
        const found = projects.find((p) => p.slug === slug);
        if (found !== undefined) {
            setProject(found);
            // Update title for client-side routing
            if (found) {
                document.title = `${found.title} - ${found.techStack.slice(0, 3).join(', ')}`;
            }
        }
    }, [projects, slug]);

    if (project === undefined) {
        return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;
    }

    if (project === null) {
        return notFound();
    }

    return <ProjectDetails project={project} />;
};

export default Page;
