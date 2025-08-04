"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip
} from "@heroui/react";
import MaskedIcon from "../core/icons/Icon";
import { colors } from "@/app/styles/designTokens";

function StatusCell({ value }) {
    const isDone = value === true || value === "Done";
    return (
        <Chip className="capitalize" color={isDone ? "success" : "danger"} size="sm" variant="flat">
            {isDone ? "Done" : "Pending"}
        </Chip>
    );
}

export function ActionsCell({ onEdit, onDelete, onStatusUpdate, value }) {
    return (
        <div className="relative w-fit gap-1 flex items-center">
            <Tooltip content="Edit">
                <span onClick={onEdit} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <MaskedIcon src="/icons/coco/line/Edit-3.svg" color="#0a0a0a" height="20px" width="20px" />
                </span>
            </Tooltip>
            <Tooltip content={value.status ? "Undo" : "Mark Done"}>
                <span onClick={onStatusUpdate} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <MaskedIcon src="/icons/coco/line/Status.svg" color="#0a0a0a" height="20px" width="20px" />
                </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete" className="text-white">
                <span onClick={onDelete} className="text-lg text-danger cursor-pointer active:opacity-50">
                    <MaskedIcon src="/icons/coco/line/Close.svg" color={colors.danger} height="20px" width="20px" />
                </span>
            </Tooltip>
        </div>
    );
}

export default function DataTable({ project }) {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));

    useEffect(() => {
        const projectId = project.id;
        if (!projectId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/v1/projects/${projectId}/data?page=1&limit=100`);
                if (!res.ok) throw new Error("Failed to load project data");
                const result = await res.json();

                // ✅ Extract table columns dynamically from API response
                const apiColumns = result.columns.map((col) => ({
                    key: col,
                    label: col.toUpperCase(),
                }));

                // ✅ Map docs into table rows (flatten data object into table)
                const apiRows = result.data.map((doc) => ({
                    key: doc.id,
                    status: doc.status,
                    ...doc.data, // spread actual fields
                }));

                setColumns([
                    ...apiColumns,
                    { key: "status", label: "STATUS" },
                    // { key: "actions", label: "ACTIONS" } // optional
                ]);
                setData(apiRows);
            } catch (err) {
                console.error("❌ Failed to fetch data table:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [project.id]);

    const handleEdit = (item) => console.log("Edit:", item);
    const handleDelete = (item) => console.log("Delete:", item);
    const handleStatusUpdate = (item) => console.log("Status Update:", item);

    const renderCell = (item, columnKey) => {
        const value = item[columnKey];
        switch (columnKey) {
            case "status":
                return <StatusCell value={value} />;
            // case "actions":
            //     return (
            //         <ActionsCell
            //             onEdit={() => handleEdit(item)}
            //             onDelete={() => handleDelete(item)}
            //             onStatusUpdate={() => handleStatusUpdate(item)}
            //             value={item}
            //         />
            //     );
            default:
                return value;
        }
    };

    if (loading) return <p>Loading data...</p>;

    return (
        <Table
            aria-label="Project data table"
            isStriped
            selectionMode="multiple"
            checkboxesProps={{
                classNames: {
                    wrapper: "after:bg-primary after:text-background text-background",
                },
            }}
            onSelectionChange={(keys) => {
                setSelectedKeys(keys);
                console.log("Selected keys:", keys);
            }}
        >
            <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>

            <TableBody items={data}>
                {(item) => (
                    <TableRow key={item.key}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
