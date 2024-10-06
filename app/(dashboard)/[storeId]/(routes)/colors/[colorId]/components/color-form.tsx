"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Color } from "@prisma/client";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(2),
  value: z.string().min(4).max(9).regex(/^#/, {
    message: "Строка должна быть действительным шестнадцатеричным кодом.",
  }),
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ColorFormProperties {
  initialData: Color | null;
}

export const ColorForm: React.FC<ColorFormProperties> = ({ initialData }) => {
  const parameters = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Редактировать цвет" : "Создать цвет";
  const description = initialData ? "Редактировать цвет." : "Добавить цвет";
  const toastMessage = initialData ? "Цвет обновлен." : "Цвет создан.";
  const action = initialData ? "Сохранить изменения" : "Создать";

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? {
      name: "",
    },
  });

  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true);
      await (initialData
        ? axios.patch(`/api/${parameters.storeId}/colors/${parameters.colorId}`, data)
        : axios.post(`/api/${parameters.storeId}/colors`, data));
      router.push(`/${parameters.storeId}/colors`);
      router.refresh();
      toast.success(toastMessage);
    } catch {
      toast.error("Что-то пошло не так.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${parameters.storeId}/colors/${parameters.colorId}`);
      router.push(`/${parameters.storeId}/colors`);
      router.refresh();
      toast.success("Цвет удален.");
    } catch {
      toast.error("Убедитесь, что вы удалили все товары, использующие этот цвет.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="size-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Название цвета" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Значение</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-x-4">
                      <Input disabled={loading} placeholder="Значение цвета" {...field} />
                      <div
                        className="rounded-full border p-4"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
