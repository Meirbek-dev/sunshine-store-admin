"use client";

import {ColumnDef} from "@tanstack/react-table";

import {CellAction} from "./cell-action";

export type CategoryColumn = {
    id: string; name: string; billboardLabel: string; createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [{
    accessorKey: "name", header: "Название",
}, {
    accessorKey: "billboard", header: "Билборд", cell: ({row}) => row.original.billboardLabel,
}, {
    accessorKey: "createdAt", header: "Дата",
}, {
    id: "actions", cell: ({row}) => <CellAction data={row.original}/>,
},];
