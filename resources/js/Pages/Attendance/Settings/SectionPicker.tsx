import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

interface SectionPickerProps extends PageProps {
    enabled: boolean;
    sections: string[];
}

export default function SectionPicker({ enabled, sections }: SectionPickerProps) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        enabled: enabled ? '1' : '0',
        sections: sections.length > 0 ? sections : [''],
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/attendance/section-picker');
    }

    function addSection() {
        setData('sections', [...data.sections, '']);
    }

    function updateSection(index: number, value: string) {
        const next = [...data.sections];
        next[index] = value;
        setData('sections', next);
    }

    function removeSection(index: number) {
        if (data.sections.length <= 1) {
            return;
        }
        setData(
            'sections',
            data.sections.filter((_, i) => i !== index),
        );
    }

    return (
        <AttendanceLayout>
            <Head title="Section Picker Settings" />

            <div className="mx-auto max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Section Picker</h1>
                    <p className="text-muted-foreground">
                        Configure sections shown on the scanner when patrons check IN.
                    </p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Scanner Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="enabled">Enable section picker on scanner</Label>
                                <select
                                    id="enabled"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={data.enabled}
                                    onChange={(e) => setData('enabled', e.target.value)}
                                >
                                    <option value="1">Enabled</option>
                                    <option value="0">Disabled</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label>Sections</Label>
                                {data.sections.map((section, index) => (
                                    <div key={index} className="flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            value={section}
                                            onChange={(e) => updateSection(index, e.target.value)}
                                            placeholder={`Section ${index + 1}`}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                            onClick={() => removeSection(index)}
                                            disabled={data.sections.length <= 1}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                {errors.sections && (
                                    <p className="text-sm text-destructive">{errors.sections}</p>
                                )}
                                <Button type="button" variant="outline" onClick={addSection}>
                                    Add Section
                                </Button>
                            </div>

                            <Button type="submit" disabled={processing}>
                                Save Settings
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
