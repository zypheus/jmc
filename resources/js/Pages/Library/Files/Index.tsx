import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import EmptyState from '@/components/library/EmptyState';
import FilterSidebarCard from '@/components/library/FilterSidebarCard';
import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface LibraryFile {
    id: number;
    filename: string;
    folder: string;
}

interface FilesIndexProps extends PageProps {
    filesByFolder: Record<string, LibraryFile[]>;
    folderCounts: Record<string, number>;
    currentFolder: string | null;
    filteredFiles: LibraryFile[] | null;
    presetLabels: Record<string, string>;
}

export default function Index({
    filesByFolder,
    folderCounts,
    currentFolder,
    filteredFiles,
    presetLabels,
}: FilesIndexProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        file: File | null;
        folder_preset: string;
        folder_custom: string;
    }>({
        file: null,
        folder_preset: Object.keys(presetLabels)[0] ?? 'general',
        folder_custom: '',
    });

    const visibleFiles: LibraryFile[] =
        filteredFiles ??
        Object.values(filesByFolder).flatMap((folderFiles) => folderFiles);

    function submitUpload(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post('/files/upload', {
            forceFormData: true,
            onSuccess: () => {
                reset('file', 'folder_custom');
            },
        });
    }

    return (
        <LibraryLayout>
            <Head title="Repository Files" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library"
                    title="Repository files"
                    description="Browse and manage uploaded library files by folder."
                />

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                    <div className="space-y-4">
                        <FilterSidebarCard title="Folders">
                            <Button
                                type="button"
                                variant={currentFolder ? 'outline' : 'default'}
                                className="w-full justify-between"
                                onClick={() => router.get('/files')}
                            >
                                All folders
                                <span>{visibleFiles.length}</span>
                            </Button>
                            {Object.entries(folderCounts).map(([folder, count]) => (
                                <Button
                                    key={folder}
                                    type="button"
                                    variant={currentFolder === folder ? 'default' : 'outline'}
                                    className="w-full justify-between"
                                    onClick={() => router.get('/files', { folder })}
                                >
                                    <span className="truncate">{folder}</span>
                                    <span>{count}</span>
                                </Button>
                            ))}
                        </FilterSidebarCard>

                        <Card>
                            <CardHeader>
                                <CardTitle>Upload file</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={submitUpload}>
                                    <div className="space-y-2">
                                        <Label htmlFor="folder_preset">Folder preset</Label>
                                        <select
                                            id="folder_preset"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={data.folder_preset}
                                            onChange={(e) => setData('folder_preset', e.target.value)}
                                            required
                                        >
                                            {Object.entries(presetLabels).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                            <option value="custom">Custom...</option>
                                        </select>
                                        {errors.folder_preset && (
                                            <p className="text-sm text-destructive">{errors.folder_preset}</p>
                                        )}
                                    </div>

                                    {data.folder_preset === 'custom' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="folder_custom">Custom folder name</Label>
                                            <Input
                                                id="folder_custom"
                                                value={data.folder_custom}
                                                onChange={(e) => setData('folder_custom', e.target.value)}
                                                placeholder="e.g. Accreditation"
                                                required
                                            />
                                            {errors.folder_custom && (
                                                <p className="text-sm text-destructive">{errors.folder_custom}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="file">File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                            required
                                        />
                                        {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Uploading…' : 'Upload'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{currentFolder ? `Files in ${currentFolder}` : 'All files'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {visibleFiles.length === 0 ? (
                                <EmptyState title="No files found" description="Upload a file or choose a different folder." />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Folder</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visibleFiles.map((file) => (
                                            <TableRow key={file.id}>
                                                <TableCell>{file.filename}</TableCell>
                                                <TableCell>{file.folder}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <a href={`/files/view/${file.id}`} target="_blank" rel="noreferrer">
                                                            <Button variant="outline" size="sm">
                                                                View
                                                            </Button>
                                                        </a>
                                                        <a href={`/files/download/${file.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                Download
                                                            </Button>
                                                        </a>
                                                        <Link href={`/files/delete/${file.id}`} method="delete" as="button">
                                                            <Button variant="destructive" size="sm">
                                                                Delete
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LibraryLayout>
    );
}
