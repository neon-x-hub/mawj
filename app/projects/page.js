import React, { Suspense } from 'react';
import ProjectsPageContent from '../components/features/projects/ProjectPageContent';

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}
