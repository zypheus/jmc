export interface JsonResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export async function postJson<T>(url: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
        const validationMessage = data.errors
            ? Object.values(data.errors as Record<string, string[]>).flat()[0]
            : null;
        throw new Error(validationMessage || data.message || 'The request could not be completed.');
    }

    return data as T;
}
