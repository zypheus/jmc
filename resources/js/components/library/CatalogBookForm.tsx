import { Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormErrorSummary, FormField } from '@/components/ui/form-field';
import { Textarea } from '@/components/ui/textarea';

export interface MarcFieldDefinition {
    id: number;
    tag: string;
    subfield: string | null;
    label: string | null;
    repeatable: boolean;
    input_type: string;
    options?: Array<string | { value?: string; label?: string }> | null;
}

export interface FrameworkField {
    id: number;
    required: boolean;
    default_value: string | null;
    book_column: string | null;
    marc_field: MarcFieldDefinition | null;
}

export interface CatalogProgram { id: number; program_code?: string; program_name: string }
export type MarcValues = Record<string, Record<string, string[]>>;

interface BookSeed {
    id: number;
    year?: string | null;
    course?: string | null;
    curriculum?: string | null;
    reserved?: boolean;
    cover_image?: string | null;
    programs?: CatalogProgram[];
}

interface Props {
    mode: 'create' | 'edit';
    endpoint: string;
    programs: CatalogProgram[];
    frameworkFields: FrameworkField[];
    marcValues?: MarcValues;
    curriculumOptions: Record<string, string>;
    book?: BookSeed;
    catalogSource?: 'openlibrary' | 'googlebooks';
    returnIsbn?: string;
    externalCoverUrl?: string;
}

function normalizedOptions(field: MarcFieldDefinition): Array<{ value: string; label: string }> {
    return (field.options ?? []).map((option) => typeof option === 'string'
        ? { value: option, label: option }
        : { value: option.value ?? option.label ?? '', label: option.label ?? option.value ?? '' }
    ).filter((option) => option.value !== '');
}

export default function CatalogBookForm({ mode, endpoint, programs, frameworkFields, marcValues = {}, curriculumOptions, book, catalogSource, returnIsbn, externalCoverUrl }: Props) {
    const initialMarc: MarcValues = {};
    frameworkFields.forEach((frameworkField) => {
        const field = frameworkField.marc_field;
        if (!field) return;
        const subfield = field.subfield ?? '_';
        const values = marcValues[field.tag]?.[subfield];
        initialMarc[field.tag] ??= {};
        initialMarc[field.tag][subfield] = values?.length ? [...values] : [frameworkField.default_value ?? ''];
    });

    const form = useForm({
        _method: mode === 'edit' ? 'put' : 'post',
        marc: initialMarc,
        program_ids: book?.programs?.map((program) => program.id) ?? [] as number[],
        year: book?.year ?? '',
        course: book?.course ?? '',
        curriculum: book?.curriculum ?? '',
        reserved: book?.reserved ?? false,
        cover_image: null as File | null,
        external_cover_url: externalCoverUrl ?? '',
        catalog_source: catalogSource ?? '',
        openlibrary_return_isbn: returnIsbn ?? '',
        multiple_copies: false,
        add_copies: false,
        copies: [{ accession_no: '', rfid: '' }],
    });

    function setMarcValue(tag: string, subfield: string, index: number, value: string) {
        const nextMarc = structuredClone(form.data.marc);
        nextMarc[tag] ??= {};
        nextMarc[tag][subfield] ??= [];
        nextMarc[tag][subfield][index] = value;
        form.setData('marc', nextMarc);
    }

    function addMarcValue(tag: string, subfield: string) {
        const nextMarc = structuredClone(form.data.marc);
        nextMarc[tag] ??= {};
        nextMarc[tag][subfield] = [...(nextMarc[tag][subfield] ?? []), ''];
        form.setData('marc', nextMarc);
    }

    function toggleProgram(programId: number, checked: boolean) {
        form.setData('program_ids', checked
            ? [...form.data.program_ids, programId]
            : form.data.program_ids.filter((id) => id !== programId));
    }

    function addCopyRow() {
        form.setData('copies', [...form.data.copies, { accession_no: '', rfid: '' }]);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(endpoint, { forceFormData: true });
    }

    const copyMode = mode === 'create' ? form.data.multiple_copies : form.data.add_copies;

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Bibliographic Record</CardTitle><CardDescription>Fields come from the active Books MARC framework.</CardDescription></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    {frameworkFields.map((frameworkField) => {
                        const field = frameworkField.marc_field;
                        if (!field) return null;
                        const subfield = field.subfield ?? '_';
                        const values = form.data.marc[field.tag]?.[subfield] ?? [''];
                        const options = normalizedOptions(field);
                        return (
                            <div key={frameworkField.id} className="space-y-3">
                                {values.map((value, index) => {
                                    const id = `marc-${field.tag}-${subfield}-${index}`;
                                    const label = `${field.tag}${field.subfield ? ` ‡${field.subfield}` : ''} — ${field.label || frameworkField.book_column || 'Field'}${index ? ` ${index + 1}` : ''}`;
                                    const required = frameworkField.required && index === 0;
                                    return (
                                        <FormField key={id} id={id} label={label} required={required}>
                                            {(controlProps) => field.input_type === 'textarea' ? (
                                                <Textarea {...controlProps} value={value} onChange={(event) => setMarcValue(field.tag, subfield, index, event.target.value)} />
                                            ) : field.input_type === 'select' && options.length ? (
                                                <select {...controlProps} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={value} onChange={(event) => setMarcValue(field.tag, subfield, index, event.target.value)}>
                                                    <option value="">Select…</option>
                                                    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                                </select>
                                            ) : (
                                                <Input {...controlProps} type={field.input_type === 'date' ? 'date' : 'text'} value={value} onChange={(event) => setMarcValue(field.tag, subfield, index, event.target.value)} />
                                            )}
                                        </FormField>
                                    );
                                })}
                                {field.repeatable && <Button type="button" variant="outline" size="sm" onClick={() => addMarcValue(field.tag, subfield)}>Add value</Button>}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card><CardHeader><CardTitle>Programs and Collection</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-2 sm:grid-cols-2">{programs.map((program) => <div key={program.id} className="flex items-center gap-2"><Checkbox id={`program-${program.id}`} checked={form.data.program_ids.includes(program.id)} onCheckedChange={(checked) => toggleProgram(program.id, checked === true)} /><Label htmlFor={`program-${program.id}`}>{program.program_code ? `${program.program_code} — ` : ''}{program.program_name}</Label></div>)}</div><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="year">Year level</Label><Input id="year" value={form.data.year} onChange={(event) => form.setData('year', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="course">Course</Label><Input id="course" value={form.data.course} onChange={(event) => form.setData('course', event.target.value)} /></div></div><div className="space-y-2"><Label htmlFor="curriculum">Collection</Label><select id="curriculum" className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={form.data.curriculum} onChange={(event) => form.setData('curriculum', event.target.value)}><option value="">None</option>{Object.entries(curriculumOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="flex items-center gap-2"><Checkbox id="reserved" checked={form.data.reserved} onCheckedChange={(checked) => form.setData('reserved', checked === true)} /><Label htmlFor="reserved">Reserved collection</Label></div></CardContent></Card>

                <Card><CardHeader><CardTitle>Cover and Copies</CardTitle></CardHeader><CardContent className="space-y-4">{book?.cover_image && <img src={`/storage/${book.cover_image}`} alt="Current cover" className="h-40 rounded object-cover" />}<div className="space-y-2"><Label htmlFor="cover">Cover image</Label><Input id="cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => form.setData('cover_image', event.target.files?.[0] ?? null)} /></div><div className="flex items-center gap-2"><Checkbox id="copy-mode" checked={copyMode} onCheckedChange={(checked) => mode === 'create' ? form.setData('multiple_copies', checked === true) : form.setData('add_copies', checked === true)} /><Label htmlFor="copy-mode">{mode === 'create' ? 'Create multiple copies' : 'Add more copies'}</Label></div>{copyMode && <div className="space-y-3">{form.data.copies.map((copy, index) => <div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"><FormField id={`copy-${index}-accession`} label={`Copy ${index + 1} accession number`}>{(props) => <Input {...props} value={copy.accession_no} onChange={(event) => { const copies = [...form.data.copies]; copies[index] = { ...copy, accession_no: event.target.value }; form.setData('copies', copies); }} />}</FormField><FormField id={`copy-${index}-rfid`} label={`Copy ${index + 1} RFID`}>{(props) => <Input {...props} value={copy.rfid} onChange={(event) => { const copies = [...form.data.copies]; copies[index] = { ...copy, rfid: event.target.value }; form.setData('copies', copies); }} />}</FormField></div>)}<Button type="button" variant="outline" size="sm" onClick={addCopyRow}>Add copy row</Button></div>}</CardContent></Card>
            </div>

            <FormErrorSummary errors={form.errors} title="Please review the catalog data." />
            <div className="flex gap-3"><Button disabled={form.processing}>{mode === 'create' ? 'Save book' : 'Update book'}</Button><Button asChild type="button" variant="outline"><Link href="/books">Cancel</Link></Button></div>
        </form>
    );
}
