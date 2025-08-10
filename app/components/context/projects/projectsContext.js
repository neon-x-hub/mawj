'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ProjectsContext = createContext();

export function ProjectsProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Helper: build query params from object
    const buildQuery = (params) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) search.append(key, value);
        });
        return search.toString();
    };

    // ✅ Fetch all projects
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/v1/projects');
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch with filters (search)
    const getProjects = async (filter = {}) => {
        try {
            setLoading(true);
            const query = buildQuery(filter);
            const url = query ? `/api/v1/projects?${query}` : '/api/v1/projects';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch filtered projects');
            const data = await res.json();
            return data.data || [];
        } catch (err) {
            console.error('Filter fetch error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    const getProjectById = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/projects/${id}`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const project = await response.json();
            return project;
        } catch (error) {
            console.error('Failed to fetch project:', error);
            throw error; // rethrow so the caller can handle it
        } finally {
            setLoading(false);
        }

    };


    // ✅ Create project
    const addProject = async (projectData) => {
        const requestBody = {
            name: projectData.name || 'مشروع جديد',
            type: projectData.type || 'card',
            ...projectData
        }
        try {
            const res = await fetch('/api/v1/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            if (!res.ok) throw new Error('Failed to create project');
            const created = await res.json();
            setProjects((prev) => [...prev, created.data || created]);
            return created;
        } catch (err) {
            console.error('Add project error:', err);
            throw err;
        }
    };

    // ✅ Update project
    const updateProject = async (id, updates) => {
        try {
            const res = await fetch(`/api/v1/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            if (!res.ok) throw new Error('Failed to update project');
            setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        } catch (err) {
            console.error('Update project error:', err);
        }
    };

    // ✅ Delete project
    const deleteProject = async (id) => {
        try {
            const res = await fetch(`/api/v1/projects/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete project');
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error('Delete project error:', err);
        }
    };

    // ✅ Placeholder: Project Data Management
    const getProjectData = async (id) => {
        try {
            const res = await fetch(`/api/v1/projects/${id}/data`);
            if (!res.ok) throw new Error('Failed to fetch project data');
            return await res.json();
        } catch (err) {
            console.error('Get project data error:', err);
            throw err;
        }
    };

    const addProjectData = async (id, payload) => {
        try {
            const res = await fetch(`/api/v1/projects/${id}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to add project data');
            return await res.json();
        } catch (err) {
            console.error('Add project data error:', err);
            throw err;
        }
    };

    const deleteProjectData = async (id) => {
        try {
            const res = await fetch(`/api/v1/projects/${id}/data`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete project data');
            return true;
        } catch (err) {
            console.error('Delete project data error:', err);
            throw err;
        }
    };

    // ✅ Upload data file for a project
    const uploadProjectDataFile = async (projectId, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/v1/projects/${projectId}/data/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Failed to upload project data file');
            return await res.json();
        } catch (err) {
            console.error('Upload project data file error:', err);
            throw err;
        }
    };


    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                setProjects,
                loading,
                error,
                fetchProjects,
                getProjects,
                getProjectById,
                addProject,
                updateProject,
                deleteProject,
                getProjectData,
                addProjectData,
                deleteProjectData,
                uploadProjectDataFile
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
}

// ✅ Custom hook
export const useProjects = () => useContext(ProjectsContext);
