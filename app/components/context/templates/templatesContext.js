'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const TemplatesContext = createContext();

export function TemplatesProvider({ children }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Helper: Convert object → URLSearchParams
    const buildQuery = (params) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) search.append(key, value);
        });
        return search.toString();
    };

    // ✅ Fetch all templates
    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/v1/templates');
            if (!res.ok) throw new Error('Failed to fetch templates');
            const data = await res.json();
            setTemplates(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch templates with filter
    const getTemplates = async (filter = {}) => {
        try {
            setLoading(true);
            const query = buildQuery(filter);
            const url = query ? `/api/v1/templates?${query}` : '/api/v1/templates';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch filtered templates');
            const data = await res.json();
            setTemplates(data.data || []);
        } catch (err) {
            console.error('Template filter fetch error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch single template by ID
    const getTemplateById = async (id) => {
        try {
            const res = await fetch(`/api/v1/templates/${id}`);
            if (!res.ok) {
                if (res.status === 404) return null;
                throw new Error('Failed to fetch template');
            }
            const data = await res.json();
            return data.data || null;
        } catch (err) {
            console.error('Get template by ID error:', err);
            throw err;
        }
    };

    // ✅ Add template
    const addTemplate = async (templateData) => {
        try {
            const res = await fetch('/api/v1/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData),
            });
            if (!res.ok) throw new Error('Failed to create template');

            const created = await res.json();
            setTemplates((prev) => [...prev, created.data || created]);
            return created.data || created;
        } catch (err) {
            console.error('Add template error:', err);
            throw err;
        }
    };

    // ✅ Update template
    const updateTemplate = async (id, updates) => {
        try {
            const res = await fetch(`/api/v1/templates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            if (!res.ok) throw new Error('Failed to update template');

            setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
        } catch (err) {
            console.error('Update template error:', err);
        }
    };

    // ✅ Delete template
    const deleteTemplate = async (id) => {
        try {
            const res = await fetch(`/api/v1/templates/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete template');

            setTemplates((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error('Delete template error:', err);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <TemplatesContext.Provider
            value={{
                templates,
                setTemplates,
                loading,
                error,
                fetchTemplates,
                getTemplates,
                getTemplateById, // ✅ Added here
                addTemplate,
                updateTemplate,
                deleteTemplate
            }}
        >
            {children}
        </TemplatesContext.Provider>
    );
}

// ✅ Custom hook for consuming the Templates context
export const useTemplates = () => useContext(TemplatesContext);
