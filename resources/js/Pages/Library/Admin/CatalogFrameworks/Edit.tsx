import { Head, Link, router, useForm } from '@inertiajs/react';

import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface MarcField {
    id: number;
    tag: string;
    subfield: string | null;
    label: string | null;
    input_type: string;
    repeatable: boolean;
}

interface FrameworkField {
    id: number;
    sort_order: number;
    visible: boolean;
    required: boolean;
    default_value: string | null;
    book_column: string | null;
    marc_field: MarcField | null;
}

interface CatalogFramework {
    id: number;
    name: string;
    fields: FrameworkField[];
}

interface CatalogFrameworkEditProps extends PageProps {
    catalog_framework: CatalogFramework;
    availableMarcFields: MarcField[];
    bookColumns: string[];
    inputTypes: string[];
}

interface FieldSettings {
    visible: boolean;
    required: boolean;
    sort_order: string;
    default_value: string;
    book_column: string;
}

export default function Edit({
    catalog_framework,
    availableMarcFields,
    bookColumns,
    inputTypes,
}: CatalogFrameworkEditProps) {
    const initialFields: Record<string, FieldSettings> = {};
    catalog_framework.fields.forEach((field) => {
        initialFields[String(field.id)] = {
            visible: field.visible,
            required: field.required,
            sort_order: String(field.sort_order ?? 0),
            default_value: field.default_value ?? '',
            book_column: field.book_column ?? '',
        };
    });

    const updateForm = useForm({
        fields: initialFields,
    });
    const attachForm = useForm({
        marc_field_id: availableMarcFields[0] ? String(availableMarcFields[0].id) : '',
    });
    const createMarcForm = useForm({
        tag: '',
        subfield: '',
        label: '',
        input_type: inputTypes[0] ?? 'text',
        repeatable: false,
        options_lines: '',
    });

    const frameworkFields = catalog_framework.fields.filter((field) => field.marc_field !== null);

    const setFieldValue = (fieldId: number, patch: Partial<FieldSettings>) => {
        updateForm.setData('fields', {
            ...updateForm.data.fields,
            [String(fieldId)]: {
                ...updateForm.data.fields[String(fieldId)],
                ...patch,
            },
        });
    };

    const saveFrameworkFields = () => {
        updateForm.transform((payload) => ({
                fields: Object.fromEntries(
                    Object.entries(payload.fields).map(([id, row]) => [
                        id,
                        {
                            visible: row.visible ? '1' : '0',
                            required: row.required ? '1' : '0',
                            sort_order: row.sort_order,
                            default_value: row.default_value,
                            book_column: row.book_column,
                        },
                    ]),
                ),
            }));
        updateForm.put(`/admin/catalog-frameworks/${catalog_framework.id}/fields`, {
            preserveScroll: true,
        });
    };

    const detachField = (fieldId: number) => {
        if (!window.confirm('Remove this tag from the framework?')) {
            return;
        }
        router.delete(`/admin/catalog-frameworks/${catalog_framework.id}/fields/${fieldId}`, {
            preserveScroll: true,
        });
    };

    const attachField = () => {
        attachForm.post(`/admin/catalog-frameworks/${catalog_framework.id}/fields`, {
            preserveScroll: true,
        });
    };

    const createAndAttachField = () => {
        createMarcForm.transform((payload) => ({
                ...payload,
                repeatable: payload.repeatable ? '1' : '0',
            }));
        createMarcForm.post(`/admin/catalog-frameworks/${catalog_framework.id}/marc-fields`, {
            preserveScroll: true,
        });
    };

    return (
        <LibraryLayout>
            <Head title={`Framework: ${catalog_framework.name}`} />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library admin"
                    title={`Framework: ${catalog_framework.name}`}
                    description="Toggle visibility, required fields, sort order, defaults, and book-column mapping."
                    actions={
                        <>
                            <Link href="/admin/catalog-frameworks">
                                <Button variant="outline" size="sm">
                                    All frameworks
                                </Button>
                            </Link>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Books
                                </Button>
                            </Link>
                        </>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Framework fields</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {frameworkFields.length === 0 ? (
                            <EmptyState
                                title="No fields in this framework"
                                description="Attach an existing MARC tag or create a new one below."
                            />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tag</TableHead>
                                            <TableHead>Label</TableHead>
                                            <TableHead>Widget</TableHead>
                                            <TableHead>Visible</TableHead>
                                            <TableHead>Required</TableHead>
                                            <TableHead>Sort</TableHead>
                                            <TableHead>Default</TableHead>
                                            <TableHead>Maps to column</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {frameworkFields.map((field) => {
                                            const marc = field.marc_field as MarcField;
                                            const formRow = updateForm.data.fields[String(field.id)];
                                            return (
                                                <TableRow key={field.id}>
                                                    <TableCell className="font-mono text-xs">
                                                        {marc.tag}
                                                        {marc.subfield ? ` ‡${marc.subfield}` : ''}
                                                    </TableCell>
                                                    <TableCell>{marc.label || '—'}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {marc.input_type}
                                                        {marc.repeatable ? ' · repeatable' : ''}
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={formRow.visible}
                                                            onChange={(event) =>
                                                                setFieldValue(field.id, { visible: event.target.checked })
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={formRow.required}
                                                            onChange={(event) =>
                                                                setFieldValue(field.id, { required: event.target.checked })
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={formRow.sort_order}
                                                            onChange={(event) =>
                                                                setFieldValue(field.id, { sort_order: event.target.value })
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={formRow.default_value}
                                                            onChange={(event) =>
                                                                setFieldValue(field.id, { default_value: event.target.value })
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            value={formRow.book_column}
                                                            onChange={(event) =>
                                                                setFieldValue(field.id, { book_column: event.target.value })
                                                            }
                                                        >
                                                            <option value="">— none —</option>
                                                            {bookColumns.map((column) => (
                                                                <option key={column} value={column}>
                                                                    {column}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() => detachField(field.id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                <Button type="button" onClick={saveFrameworkFields} disabled={updateForm.processing}>
                                    {updateForm.processing ? 'Saving...' : 'Save changes'}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add existing tag</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {availableMarcFields.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    All defined tags are already in this framework.
                                </p>
                            ) : (
                                <>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={attachForm.data.marc_field_id}
                                        onChange={(event) => attachForm.setData('marc_field_id', event.target.value)}
                                    >
                                        {availableMarcFields.map((field) => (
                                            <option key={field.id} value={String(field.id)}>
                                                {field.tag}
                                                {field.subfield ? ` ‡${field.subfield}` : ''}
                                                {field.label ? ` — ${field.label}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <Button type="button" size="sm" onClick={attachField} disabled={attachForm.processing}>
                                        {attachForm.processing ? 'Adding...' : 'Add to framework'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Define new tag and add</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="tag">Tag</Label>
                                    <Input
                                        id="tag"
                                        value={createMarcForm.data.tag}
                                        onChange={(event) => createMarcForm.setData('tag', event.target.value)}
                                        maxLength={3}
                                        placeholder="246"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subfield">Subfield</Label>
                                    <Input
                                        id="subfield"
                                        value={createMarcForm.data.subfield}
                                        onChange={(event) => createMarcForm.setData('subfield', event.target.value)}
                                        maxLength={1}
                                        placeholder="a"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="label">Label</Label>
                                <Input
                                    id="label"
                                    value={createMarcForm.data.label}
                                    onChange={(event) => createMarcForm.setData('label', event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="input_type">Input type</Label>
                                <select
                                    id="input_type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={createMarcForm.data.input_type}
                                    onChange={(event) => createMarcForm.setData('input_type', event.target.value)}
                                >
                                    {inputTypes.map((inputType) => (
                                        <option key={inputType} value={inputType}>
                                            {inputType}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {createMarcForm.data.input_type === 'select' && (
                                <div className="space-y-2">
                                    <Label htmlFor="options_lines">Select options (one per line)</Label>
                                    <textarea
                                        id="options_lines"
                                        rows={4}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={createMarcForm.data.options_lines}
                                        onChange={(event) => createMarcForm.setData('options_lines', event.target.value)}
                                    />
                                </div>
                            )}
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={createMarcForm.data.repeatable}
                                    onChange={(event) =>
                                        createMarcForm.setData('repeatable', event.target.checked)
                                    }
                                />
                                Repeatable
                            </label>
                            <Button
                                type="button"
                                size="sm"
                                onClick={createAndAttachField}
                                disabled={createMarcForm.processing}
                            >
                                {createMarcForm.processing ? 'Creating...' : 'Create & add'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LibraryLayout>
    );
}
