"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
} from "@heroui/react";
import ActionButtonWithOptionalModal from "../core/buttons/ActionButtonWithModal";
import { t } from "@/app/i18n";
import GenerateImageModal from "../core/modal/GenerateImageModal";

function StatusCell({ value }) {
    const isDone = value === true || value === "Done";
    return (
        <Chip className="capitalize" color={isDone ? "success" : "danger"} size="sm" variant="flat">
            {isDone ? "Done" : "Pending"}
        </Chip>
    );
}

export default function DataTable({ data, setData, columns, project }) {
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)

    /** ✅ Helper to call the POST bulk endpoint */
    const sendBulkUpdate = async (updates) => {
        try {
            const res = await fetch(`/api/v1/projects/${project.id}/data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error("Failed to update data");
            const result = await res.json();
            console.log("✅ Update result:", result);
            return result;
        } catch (err) {
            console.error("❌ Bulk update failed:", err);
        }
    };

    /** ✅ Action handlers */
    const handleEdit = async (formData) => {
        const selected = Array.from(selectedKeys);
        if (selected.length !== 1) return;

        const payload = [
            { id: selected[0], updates: { data: formData } }
        ];

        await sendBulkUpdate(payload);

        // Optimistically update local state
        setData((prev) =>
            prev.map((row) =>
                row.key === selected[0] ? { ...row, ...formData } : row
            )
        );
    };

    const handleDelete = async () => {
        const selected = Array.from(selectedKeys);
        const payload = selected.map((id) => ({ id, updates: null }));

        await sendBulkUpdate(payload);

        // Optimistically remove locally
        setData((prev) => prev.filter((row) => !selected.includes(row.key)));
        setSelectedKeys(new Set([]));
    };

    const handleToggleStatus = async (isDone) => {
        const selected = Array.from(selectedKeys);
        const payload = selected.map((id) => ({ id, updates: { status: isDone } }));

        await sendBulkUpdate(payload);

        // Optimistically update status locally
        setData((prev) =>
            prev.map((row) =>
                selected.includes(row.key) ? { ...row, status: isDone } : row
            )
        );
    };

    const handleGenerate = async (formData, onClose) => {
        setIsProcessing(true)
        setProgress(0)

        try {
            const requestBody = {
                options: {
                    format: formData.format ?? 'png',
                    regenerate_done: formData.regenerate_done ?? false,
                    parallelWorkers: formData.parallelWorkers ?? 1,
                    range: Array.from(selectedKeys)
                },
                project: project.id
            }

            console.log('Generation request:', requestBody);


            const res = await fetch('/api/v1/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })

            if (!res.ok) throw new Error('Generation failed to start')

            const { jobId } = await res.json()

            while (progress < 100) {
                await new Promise(r => setTimeout(r, 1000))

                const statusRes = await fetch(`/api/v1/generate/status/${jobId}`)
                if (!statusRes.ok) throw new Error('Failed to get status')

                const status = await statusRes.json()
                const newProgress = status.progress || progress
                setProgress(Math.min(newProgress, 100))

                if (newProgress >= 100) break
            }

        } catch (error) {
            console.error('Generation error:', error)
        } finally {
            setIsProcessing(false)
            window.location.reload()
        }
    }

    /** ✅ Render table cells */
    const renderCell = (item, columnKey) => {
        const value = item[columnKey];
        switch (columnKey) {
            case "status":
                return <StatusCell value={value} />;
            default:
                return value;
        }
    };

    /** ✅ Action buttons configuration */
    const actionButtons = [
        {
            label: t("actions.delete"),
            isPrimary: false,
            onClick: handleDelete,
            modal: {
                title: t("actions.delete"),
                content: t("messages.caution.confirm_delete_multiple"),
                actionLabel: t("actions.delete"),
                closeLabel: t("actions.cancel"),
                action: handleDelete,
                isDanger: true,
            },
        },
        {
            label: t("actions.mark_pending"),
            isPrimary: true,
            onClick: () => handleToggleStatus(false),
        },
        {
            label: t("actions.mark_done"),
            isPrimary: true,
            onClick: () => handleToggleStatus(true),
        },
        {
            label: t("actions.edit"),
            isPrimary: true,
            onClick: () => { }, // open modal via ActionButtonWithOptionalModal
            disabledCondition: () => selectedKeys.size !== 1,
            modal: {
                title: t("actions.edit_item"),
                content: ({ formData, handleInputChange }) => (
                    <form className="space-y-2">
                        <input
                            type="text"
                            name="title"
                            placeholder="New title"
                            value={formData.title || ""}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                        />
                    </form>
                ),
                actionLabel: "Save Changes",
                closeLabel: "Cancel",
                action: handleEdit,
            },
        },
        {
            /* Quick Generation */
            label: t("actions.generate"),
            isPrimary: true,
            modal: {
                content: (props) => (
                    project.type === 'card' && <GenerateImageModal
                        project={project}
                        {...props}
                        isProcessing={isProcessing}
                        progress={progress}
                    />
                ), actionLabel: t("actions.generate"),
                hasCancelButton: false,
                action: async (formData, onClose) => {
                    await handleGenerate(formData, onClose)
                },
                isProcessing,
            }
        }
    ];

    return (
        <div className="flex flex-col gap-3">
            {/* ✅ Animated Action Bar */}
            <AnimatePresence>
                {selectedKeys.size > 0 && (
                    <motion.div
                        key="action-bar"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex gap-2 items-center text-white"
                    >
                        {actionButtons.map((btn, idx) => (
                            <ActionButtonWithOptionalModal
                                key={idx}
                                label={btn.label}
                                endIconUrl={btn.endIconUrl}
                                isPrimary={btn.isPrimary}
                                onClick={btn.onClick}
                                modal={btn.modal}
                                endIconSize="18px"
                                disabled={btn.disabledCondition?.()}
                                className="w-auto text-[15px] h-[30px] px-4 r30 gap-1"
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✅ Table */}
            {data.length > 0 ? <Table
                aria-label="Project data table"
                isStriped
                selectionMode="multiple"
                checkboxesProps={{
                    classNames: {
                        wrapper: "after:bg-primary after:text-background text-background",
                    },
                }}
                onSelectionChange={(keys) => {
                    if (keys === 'all') keys = new Set(data.map((item) => item.key));
                    setSelectedKeys(keys)
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
            </Table> : (
                <div className="text-center font-bold text-2xl opacity-80 h-52 flex items-center justify-center text-gray-500">
                    <p className="text-gray-500">{t("messages.error.no_data")}</p>
                </div>
            )}
        </div>
    );
}
