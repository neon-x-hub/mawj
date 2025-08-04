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
import MaskedIcon from "../core/icons/Icon";
import { colors } from "@/app/styles/designTokens";
import { t } from "@/app/i18n";

function StatusCell({ value }) {
    const isDone = value === true || value === "Done";
    return (
        <Chip
            className="capitalize"
            color={isDone ? "success" : "danger"}
            size="sm"
            variant="flat"
        >
            {isDone ? "Done" : "Pending"}
        </Chip>
    );
}

export default function DataTable({ data, setData, columns }) {
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));

    // ✅ Action handlers
    const handleEdit = () => {
        const selected = Array.from(selectedKeys);
        if (selected.length === 1) {
            const item = data.find((row) => row.key === selected[0]);
            console.log("Edit:", item);
        }
    };

    const handleDelete = () => {
        const selected = Array.from(selectedKeys);
        console.log("Delete items:", selected);
        // setData(data.filter((row) => !selected.includes(row.key)));
    };

    const handleToggleStatus = () => {
        const selected = Array.from(selectedKeys);
        console.log("Toggle status for:", selected);
        // implement toggle logic
    };

    const renderCell = (item, columnKey) => {
        const value = item[columnKey];
        switch (columnKey) {
            case "status":
                return <StatusCell value={value} />;
            default:
                return value;
        }
    };

    // ✅ Define the button configuration array
    const actionButtons = [
        {
            label: t("actions.delete"),
            isPrimary: false,
            onClick: handleDelete,
            modal: {
                title: "Confirm Delete",
                content: "Are you sure you want to delete the selected items?",
                actionLabel: "Confirm",
                closeLabel: "Cancel",
                action: () => handleDelete(),
            },
        },
        {
            label: t("actions.mark_pending"),
            isPrimary: true,
            onClick: handleToggleStatus,
        },
        {
            label: t("actions.mark_done"),
            isPrimary: true,
            onClick: handleToggleStatus,
        },
        {
            label: t("actions.edit"),
            isPrimary: true,
            onClick: handleEdit,
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
                action: (formData) => console.log("Save edits:", formData),
            },
        },
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
            <Table
                aria-label="Project data table"
                isStriped
                selectionMode="multiple"
                checkboxesProps={{
                    classNames: {
                        wrapper: "after:bg-primary after:text-background text-background",
                    },
                }}
                onSelectionChange={(keys) => setSelectedKeys(keys)}
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
        </div>
    );
}
