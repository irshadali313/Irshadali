import ProjectForm from '../_components/ProjectForm';
import { IProject } from '@/types';

const emptyProject: IProject = {
    title: '',
    slug: '',
    year: new Date().getFullYear(),
    description: '',
    role: '',
    techStack: [],
    thumbnail: '',
    longThumbnail: '',
    images: [],
    liveUrl: '',
    sourceCode: '',
};

export default function NewProjectPage() {
    return <ProjectForm initialData={emptyProject} isNew />;
}
