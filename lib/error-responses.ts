import { NextResponse } from 'next/server';

type ErrorResponseOptions = {
  message?: string;
  details?: unknown;
  headers?: Record<string, string>;
};

export const errorResponses = {
  // Клиентские ошибки (4xx)
  badRequest: (message = 'Неверный запрос', options?: ErrorResponseOptions) =>
    createErrorResponse(400, message, options),

  unauthorized: (message = 'Пользователь не аутентифицирован', options?: ErrorResponseOptions) =>
    createErrorResponse(401, message, options),

  forbidden: (message = 'Доступ запрещен', options?: ErrorResponseOptions) =>
    createErrorResponse(403, message, options),

  notFound: (message = 'Ресурс не найден', options?: ErrorResponseOptions) =>
    createErrorResponse(404, message, options),

  methodNotAllowed: (message = 'Метод не разрешен', options?: ErrorResponseOptions) =>
    createErrorResponse(405, message, options),

  conflict: (message = 'Конфликт данных', options?: ErrorResponseOptions) =>
    createErrorResponse(409, message, options),

  validationError: (message = 'Ошибка валидации', options?: ErrorResponseOptions) =>
    createErrorResponse(422, message, options),

  // Серверные ошибки (5xx)
  serverError: (error: unknown, message = 'Внутренняя ошибка сервера') => {
    console.error('[SERVER_ERROR]', error);
    return createErrorResponse(500, message, {
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  },

  serviceUnavailable: (message = 'Сервис временно недоступен', options?: ErrorResponseOptions) =>
    createErrorResponse(503, message, options),

  // Специфичные ошибки для бизнес-логики
  storeNotFound: (message = 'Магазин не найден', options?: ErrorResponseOptions) =>
    createErrorResponse(404, message, options),

  productNotFound: (message = 'Товар не найден', options?: ErrorResponseOptions) =>
    createErrorResponse(404, message, options),

  insufficientPermissions: (message = 'Недостаточно прав', options?: ErrorResponseOptions) =>
    createErrorResponse(403, message, options),

  invalidCredentials: (message = 'Неверные учетные данные', options?: ErrorResponseOptions) =>
    createErrorResponse(401, message, options),

  // Утилиты для создания кастоммных ошибок
  custom: (status: number, message: string, options?: ErrorResponseOptions) =>
    createErrorResponse(status, message, options),
};

// Вспомогательная функция для создания ответов об ошибках
function createErrorResponse(
  status: number,
  message: string,
  options?: ErrorResponseOptions,
): NextResponse {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const responseBody = {
    error: {
      status,
      message,
      ...(options?.details ? { details: options.details } : {}),
    },
  };

  return new NextResponse(JSON.stringify(responseBody), {
    status,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });
}

// Типы для TypeScript
export type ErrorResponse = ReturnType<typeof createErrorResponse>;
