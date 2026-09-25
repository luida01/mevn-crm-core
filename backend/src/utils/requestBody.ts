export const pickRequestFields = <T extends object>(
    value: unknown,
    allowedFields: readonly (keyof T)[]
): Partial<T> | null => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return null;
    }

    const source = value as Record<string, unknown>;
    const allowed = new Set<string>(allowedFields.map(String));
    const fields = Object.fromEntries(
        Object.entries(source).filter(([key]) => allowed.has(key))
    ) as Partial<T>;

    return Object.keys(fields).length > 0 ? fields : null;
};

export const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : 'Unexpected error';
};

export const parseLimit = (value: unknown, fallback: number, maximum = 100): number => {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

export const escapeRegex = (value: string): string => {
    const metacharacters = '.*+?^' + '$' + '{}()|[]\\';
    return [...value].map((character) => (
        metacharacters.includes(character) ? '\\' + character : character
    )).join('');
};
