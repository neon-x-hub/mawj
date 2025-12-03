'use client';
import { addToast } from '@heroui/react';
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
            if (!res.ok){
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to fetch filtered projects');
            }
            const data = await res.json();
            return data.data || [];
        } catch (err) {
            console.error('Filter fetch error:', err);
            addToast({
                title: 'حدث خطأ في التحميل',
                description: err.message,
                color: 'danger',
            })
        } finally {
            setLoading(false);
        }
    };
    const getProjectById = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/projects/${id}`);

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || 'Failed to fetch project');
            }

            const project = await response.json();
            return project;
        } catch (error) {
            console.error('Failed to fetch project:', error);
            addToast({
                title: 'حدث خطأ في التحميل',
                description: error.message,
                color: 'danger',
            })
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
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to create project');
            };
            const created = await res.json();
            setProjects((prev) => [...prev, created.data || created]);
            addToast({
                title: 'تم الإضافة بنجاح',
                color: 'success',
            })
            return created;
        } catch (err) {
            console.log('Add project error:', err);
            addToast({
                title: 'حدث خطأ في الإضافة',
                description: err.message,
                color: 'danger',
            })
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
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to update project');
            }
            setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
            addToast({
                title: 'تم التحديث بنجاح',
                color: 'success',
            })
        } catch (err) {
            console.error('Update project error:', err);
            addToast({
                title: 'حدث خطأ في التحديث',
                description: err.message,
                color: 'danger',
            })
        }
    };

    // ✅ Delete project
    const deleteProject = async (id) => {
        try {
            const res = await fetch(`/api/v1/projects/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to delete project');

            }
            setProjects((prev) => prev.filter((p) => p.id !== id));
            addToast({
                title: 'تم الحذف بنجاح',
                color: 'success',
            })
        } catch (err) {
            console.error('Delete project error:', err);
            addToast({
                title: 'حدث خطأ في الحذف',
                description: err.message,
                color: 'danger',
            })
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
            const res = await fetch(`/api/v1/projects/${id}/data/add`, {
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

            const payload = await res.json();
            if (!res.ok) {
                addToast({
                    title: payload.error,
                    description: payload.details,
                    color: 'danger',
                })
                throw new Error(payload.error);
            };
            return payload;
        } catch (err) {
            console.error('Upload project data file error:', err);
            throw err;
        }
    };

    const exportProjectData = async (id, options) => {
        try {
            const body = JSON.stringify(options);
            // sends a post request to /projects/:id/data/export
            const res = await fetch(`/api/v1/projects/${id}/data/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            });
            if (!res.ok) throw new Error('Failed to export project data');
            return await res.json();
        } catch (err) {
            console.error('Export project data error:', err);
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
                uploadProjectDataFile,
                exportProjectData
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
}

// ✅ Custom hook
export const useProjects = () => useContext(ProjectsContext);
