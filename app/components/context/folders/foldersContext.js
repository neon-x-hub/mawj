'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const FoldersContext = createContext();

export function FoldersProvider({ children }) {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Fetch all folders
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

    // ✅ Add a new folder
    const addFolder = async (folderData) => {
        try {
            const res = await fetch('/api/v1/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(folderData),
            });
            if (!res.ok) throw new Error('Failed to create folder');

            const created = await res.json();
            console.log('✅ Folder created:', created);

            // Append the new folder to state (or refetch if needed)
            setFolders((prev) => [...prev, created.data || created]);
            return created;
        } catch (err) {
            console.error('Add error:', err);
            throw err;
        }
    };

    // ✅ Update folder
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

    // ✅ Delete folder
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
            value={{ folders, loading, error, fetchFolders, addFolder, updateFolder, deleteFolder }}
        >
            {children}
        </FoldersContext.Provider>
    );
}

// ✅ Custom hook
export const useFolders = () => useContext(FoldersContext);
