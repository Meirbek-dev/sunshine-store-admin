"use client";

import axios from "axios";
import {useState} from "react";
import {Copy, Edit, MoreHorizontal, Trash} from "lucide-react";
import {toast} from "react-hot-toast";
import {useParams, useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {AlertModal} from "@/components/modals/alert-modal";

import {SizeColumn} from "./columns";

interface CellActionProps {
    data: SizeColumn;
}

export const CellAction: React.FC<CellActionProps> = ({data}) => {
    const router = useRouter();
    const params = useParams();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const onConfirm = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/sizes/${data.id}`);
            toast.success("Размер удален.");
            router.refresh();
        } catch (error) {
            toast.error("Убедитесь, что вы удалили все товары этого размера.");
        } finally {
            setOpen(false);
            setLoading(false);
        }
    };

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Идентификатор размера скопирован в буфер обмена.");
    };

    return (<>
        <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onConfirm}
            loading={loading}
        />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Открыть меню</span>
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onCopy(data.id)}>
                    <Copy className="mr-2 h-4 w-4"/> Копировать идентификатор размера
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push(`/${params.storeId}/sizes/${data.id}`)}
                >
                    <Edit className="mr-2 h-4 w-4"/> Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                    <Trash className="mr-2 h-4 w-4"/> Удалить
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>);
};
