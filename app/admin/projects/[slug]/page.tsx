'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IProject } from '@/types';
import ProjectForm from '../_components/ProjectForm';
import Link from 'next/link';

export default function EditProjectPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [project, setProject] = useState<IProject | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        const fetchProject = async () => {
            try {
                const res = await fetch('/api/portfolio/data');
                if (res.ok) {
                    const data = await res.json();
                    const projects: IProject[] = data.projects || [];
                    const found = projects.find((p) => p.slug === slug);
                    if (found) {
                        setProject(found);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [slug]);

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-empty" style={{ paddingTop: '5rem' }}>
                    <p className="admin-empty-subtitle">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="admin-page">
                <div className="admin-empty" style={{ paddingTop: '5rem' }}>
                    <p className="admin-empty-title">Project not found</p>
                    <p className="admin-empty-subtitle" style={{ marginBottom: '1.5rem' }}>
                        No project with slug &quot;{slug}&quot;
                    </p>
                    <Link href="/admin/projects" className="admin-btn admin-btn-primary">
                        ← Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return <ProjectForm initialData={project} isNew={false} />;
}
