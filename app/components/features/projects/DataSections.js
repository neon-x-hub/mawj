"use client";
import React, { useEffect, useState } from "react";
import DataTable from "../../tables/DataTable";
import DataSectionHead from "./DataSectionHead";
import { Skeleton } from "@heroui/react";

export default function DataSection({ project }) {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!project?.id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/v1/projects/${project.id}/data?page=1&limit=100`);
                if (!res.ok) throw new Error("Failed to load project data");
                const result = await res.json();

                const apiColumns = result.columns.map((col) => ({
                    key: col,
                    label: col.toUpperCase(),
                }));

                const apiRows = result.data.map((doc) => ({
                    key: doc.id,
                    status: doc.status,
                    ...doc.data,
                }));

                setColumns([
                    ...apiColumns,
                    { key: "status", label: "STATUS" },
                ]);
                setData(apiRows);
            } catch (err) {
                console.error("❌ Failed to fetch data table:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [project?.id]);

    // ✅ Show loading skeleton if data is being fetched
    if (loading) {
        return (
            <>
                <DataSectionHead project={project} />
                <div className="p-4">
                    <div className="border rounded-lg shadow-sm space-y-3">
                        <div className="flex items-center space-x-4 gap-2 p-4">
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                        </div>
                    </div>
                </div>

            </>
        )
    }

    return (
        <>
            <DataSectionHead project={project} data={data} setData={setData} />
            <DataTable
                data={data}
                setData={setData}
                columns={columns}
            />
        </>
    );
}
