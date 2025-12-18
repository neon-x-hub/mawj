'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const FoldersContext = createContext();

export function FoldersProvider({ children }) {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const buildQuery = (params) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) search.append(key, value);
        });
        return search.toString();
    };


    const fetchFolders = async () => {
        try {
            const res = await fetch('/api/v1/folders');
            if (!res.ok) throw new Error('Failed to fetch folders');
            const data = await res.json();
            setFolders(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const getFolders = async (filter = {}) => {
        try {
            setLoading(true);
            const query = buildQuery(filter);
            const url = query ? `/api/v1/folders?${query}` : '/api/v1/folders';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch filtered folders');
            const data = await res.json();
            setFolders(data.data || []);
        } catch (err) {
            console.error('Filter fetch error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const addFolder = async (folderData) => {
        try {
            const res = await fetch('/api/v1/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(folderData),
            });
            if (!res.ok) throw new Error('Failed to create folder');

            const created = await res.json();
            setFolders((prev) => [...prev, created.data || created]);
            return created;
        } catch (err) {
            console.error('Add error:', err);
            throw err;
        }
    };


    const updateFolder = async (id, updates) => {
        try {
            const res = await fetch(`/api/v1/folders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            if (!res.ok) throw new Error('Failed to update folder');
            setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
        } catch (err) {
            console.error('Update error:', err);
        }
    };


    const deleteFolder = async (id) => {
        try {
            const res = await fetch(`/api/v1/folders/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete folder');
            setFolders((prev) => prev.filter((f) => f.id !== id));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    return (
        <FoldersContext.Provider
            value={{
                folders,
                setFolders,
                loading,
                error,
                fetchFolders,
                getFolders,
                addFolder,
                updateFolder,
                deleteFolder
            }}
        >
            {children}
        </FoldersContext.Provider>
    );
}


export const useFolders = () => useContext(FoldersContext);
