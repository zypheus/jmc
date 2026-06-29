import { Head } from '@inertiajs/react';

import CatalogBookForm, { type CatalogProgram, type FrameworkField, type MarcValues } from '@/components/library/CatalogBookForm';
import LibraryLayout from '@/Layouts/LibraryLayout';

interface Book { id: number; title_statement?: string; year?: string | null; course?: string | null; curriculum?: string | null; reserved?: boolean; cover_image?: string | null; programs?: CatalogProgram[] }

export default function Edit({ book, programs, frameworkFields, marcValues, curriculumOptions }: { book: Book; programs: CatalogProgram[]; frameworkFields: FrameworkField[]; marcValues: MarcValues; curriculumOptions: Record<string, string> }) {
    return <LibraryLayout><Head title="Edit Book" /><div className="space-y-6"><div><h1 className="text-2xl font-semibold">Edit Book</h1><p className="text-muted-foreground">{book.title_statement ?? 'Untitled catalog record'}</p></div><CatalogBookForm mode="edit" endpoint={`/book/${book.id}`} programs={programs} frameworkFields={frameworkFields} marcValues={marcValues} curriculumOptions={curriculumOptions} book={book} /></div></LibraryLayout>;
}
