'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useStoreModal } from '@/hooks/use-store-modal';

const formSchema = z.object({
  name: z.string().min(1, 'Название магазина не может быть пустым.'),
});

export const StoreModal = () => {
  const storeModal = useStoreModal();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/stores', values);
      window.location.assign(`/${response.data.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не удалось создать магазин.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Modal
      title="Создать магазин"
      description="Добавьте новый магазин для менеджмента товарами и категориями."
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          aria-busy={loading}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Название магазина"
                    {...field}
                    aria-invalid={!!form.formState.errors.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-end gap-2 pt-6">
            <Button
              disabled={loading}
              variant="outline"
              onClick={storeModal.onClose}
              aria-label="Отменить создание магазина"
            >
              Отменить
            </Button>
            <Button
              disabled={loading}
              type="submit"
              aria-label="Подтвердить создание магазина"
            >
              {loading ? 'Загрузка...' : 'Продолжить'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};
