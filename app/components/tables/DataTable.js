"use client";

import React from "react";

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    getKeyValue,
    Chip,
    Tooltip
} from "@heroui/react";

import MaskedIcon from "../core/icons/Icon";

import { colors } from "@/app/styles/designTokens";

const rows = [
    {
        key: "1",
        name: "Tony Reichert",
        role: "CEO",
        status: "Done",
    },
    {
        key: "2",
        name: "Zoey Lang",
        role: "Technical Lead",
        status: "Pending",
    },
    {
        key: "3",
        name: "Jane Fisher",
        role: "Senior Developer",
        status: "Done",
    },
    {
        key: "4",
        name: "William Howard",
        role: "Community Manager",
        status: "Done",
    },
    {
        key: "5",
        name: "William Howard",
        role: "Community Manager",
        status: "Pending",
    },
    {
        key: "6",
        name: "William Howard",
        role: "Community Manager",
        status: "Pending",
    },
    {
        key: "7",
        name: "William Howard",
        role: "Community Manager",
        status: "Pending",
    },
];

const columns = [
    {
        key: "name",
        label: "NAME",
    },
    {
        key: "role",
        label: "ROLE",
    },
    {
        key: "status",
        label: "STATUS",
    },
    /*     {
            key: "actions",
            label: "ACTIONS",
        }, */
];

function StatusCell({ value }) {
    const isDone = value === "Done";
    return (
        <Chip className="capitalize" color={isDone ? "success" : "danger"} size="sm" variant="flat">
            {value}
        </Chip>
    );
}

export function ActionsCell({ onEdit, onDelete, onStatusUpdate, value }) {
    return (
        <div className="relative w-fit gap-1 flex items-center">

            <Tooltip content="Edit">
                <span
                    onClick={onEdit}
                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                    <MaskedIcon
                        src="/icons/coco/line/Edit-3.svg"
                        color="#0a0a0a"
                        height="20px"
                        width="20px"
                    />
                </span>
            </Tooltip>

            <Tooltip content={value.status === "Done" ? "Undo" : "Mark Done"}>
                <span
                    onClick={onStatusUpdate}
                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                    <MaskedIcon
                        src="/icons/coco/line/Status.svg"
                        color="#0a0a0a"
                        height="20px"
                        width="20px"
                    />
                </span>
            </Tooltip>

            <Tooltip color="danger" content="Delete" className="text-white">
                <span
                    onClick={onDelete}
                    className="text-lg text-danger cursor-pointer active:opacity-50"
                >
                    <MaskedIcon
                        src="/icons/coco/line/Close.svg"
                        color={colors.danger}
                        height="20px"
                        width="20px"
                    />
                </span>
            </Tooltip>
        </div>
    );
}


export default function DataTable() {

    const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;


    const handleEdit = (item) => {
        console.log('Edit:', item);
    };

    const handleDelete = (item) => {
        console.log('Delete:', item);
    };

    const handleStatusUpdate = (item) => {
        console.log('Status Update:', item);
    };

    const renderCell = (item, columnKey) => {
        const value = item[columnKey];

        switch (columnKey) {
            case 'status':
                return <StatusCell value={value} />;

            /*             case 'actions':
                            return <ActionsCell
                                onEdit={() => handleEdit(item)}
                                onDelete={() => handleDelete(item)}
                                onStatusUpdate={() => handleStatusUpdate(item)}
                                value={item}
                            />; */

            default:
                return value;
        }
    };

    return (
        <Table
            aria-label="Example table with dynamic content"
            isStriped
            selectionMode="multiple"
            checkboxesProps={{
                classNames: {
                    wrapper: "after:bg-primary after:text-background text-background",
                },
            }}
            onSelectionChange={(keys) => {
                setSelectedKeys(keys)
                console.log('Selected keys:', keys);
            }
            }
        >
            <TableHeader columns={columns} className="bg-blue-50">
                {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
            </TableHeader>

            <TableBody items={rows}>
                {(item) => (
                    <TableRow key={item.key}>
                        {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
