"use client";

import * as z from "zod";
import axios from "axios";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "react-hot-toast";
import {Trash} from "lucide-react";
import {Store} from "@prisma/client";
import {useParams, useRouter} from "next/navigation";
import {useState} from "react";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Separator} from "@/components/ui/separator";
import {Heading} from "@/components/ui/heading";
import {AlertModal} from "@/components/modals/alert-modal";
import {ApiAlert} from "@/components/ui/api-alert";
import {useOrigin} from "@/hooks/use-origin";

const formSchema = z.object({
    name: z.string().min(2),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
    initialData: Store;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({initialData}) => {
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema), defaultValues: initialData,
    });

    const onSubmit = async (data: SettingsFormValues) => {
        try {
            setLoading(true);
            await axios.patch(`/api/stores/${params.storeId}`, data);
            router.refresh();
            toast.success("Магазин обновлен.");
        } catch (error: any) {
            toast.error("Что-то пошло не так.");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/stores/${params.storeId}`);
            router.refresh();
            router.push("/");
            toast.success("Магазин удален.");
        } catch (error: any) {
            toast.error("Убедитесь, что вы удалили все товары и категории.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (<>
        <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
        />
        <div className="flex items-center justify-between">
            <Heading
                title="Настройки магазина"
                description=""
            />
            <Button
                disabled={loading}
                variant="destructive"
                size="sm"
                onClick={() => setOpen(true)}
            >
                <Trash className="h-4 w-4"/>
            </Button>
        </div>
        <Separator/>
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
            >
                <div className="grid grid-cols-3 gap-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (<FormItem>
                            <FormLabel>Название</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={loading}
                                    placeholder="Название магазина"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>)}
                    />
                </div>
                <Button disabled={loading} className="ml-auto" type="submit">
                    Сохранить изменения
                </Button>
            </form>
        </Form>
        <Separator/>
        <ApiAlert
            title="NEXT_PUBLIC_API_URL"
            variant="public"
            description={`${origin}/api/${params.storeId}`}
        />
    </>);
};
