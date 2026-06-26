import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface PatronTerms {
    fine_per_day: number;
    max_fine: number | null;
    grace_period_days: number;
    loan_duration_days: number;
}

interface EditProps extends PageProps {
    studentMax: number;
    employeeUnlimited: boolean;
    employeeMax: number;
    maxRenewals: number;
    reborrowCooldownDays: number;
    reservationHoldDays: number;
    studentTerms: PatronTerms;
    employeeTerms: PatronTerms;
}

export default function Edit({
    studentMax,
    employeeUnlimited,
    employeeMax,
    maxRenewals,
    reborrowCooldownDays,
    reservationHoldDays,
    studentTerms,
    employeeTerms,
}: EditProps) {
    const { flash } = usePage<EditProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        student_max: studentMax,
        employee_unlimited: employeeUnlimited ? '1' : '0',
        employee_max: employeeMax,
        max_renewals: maxRenewals,
        reborrow_cooldown_days: reborrowCooldownDays,
        reservation_hold_days: reservationHoldDays,
        student_fine_per_day: studentTerms.fine_per_day,
        student_max_fine: studentTerms.max_fine ?? '',
        student_grace_period_days: studentTerms.grace_period_days,
        student_loan_duration_days: studentTerms.loan_duration_days,
        employee_fine_per_day: employeeTerms.fine_per_day,
        employee_max_fine: employeeTerms.max_fine ?? '',
        employee_grace_period_days: employeeTerms.grace_period_days,
        employee_loan_duration_days: employeeTerms.loan_duration_days,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/circulation-policy', { preserveScroll: true });
    }

    const employeeUnlimitedChecked = data.employee_unlimited === '1';

    return (
        <LibraryLayout>
            <Head title="Circulation Policy" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library"
                    title="Circulation policy"
                    description="Manage borrow limits, renewals, and fine settings."
                    actions={
                        <>
                            <Link href="/admin/fines/outstanding">
                                <Button variant="outline" size="sm">
                                    Outstanding fines
                                </Button>
                            </Link>
                            <Link href="/dashboard/library-admin">
                                <Button variant="outline" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        </>
                    }
                />

                {flash.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Borrow limits</CardTitle>
                            <CardDescription>Maximum active loans per patron type</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="student_max">Student max loans</Label>
                                <Input
                                    id="student_max"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={data.student_max}
                                    onChange={(e) => setData('student_max', parseInt(e.target.value, 10) || 1)}
                                />
                                {errors.student_max && <p className="text-sm text-destructive">{errors.student_max}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="employee_max">Employee max loans</Label>
                                <Input
                                    id="employee_max"
                                    type="number"
                                    min={1}
                                    max={100}
                                    disabled={employeeUnlimitedChecked}
                                    value={data.employee_max}
                                    onChange={(e) => setData('employee_max', parseInt(e.target.value, 10) || 1)}
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={employeeUnlimitedChecked}
                                        onChange={(e) => setData('employee_unlimited', e.target.checked ? '1' : '0')}
                                    />
                                    Unlimited employee loans
                                </label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_renewals">Max renewals per loan</Label>
                                <Input
                                    id="max_renewals"
                                    type="number"
                                    min={0}
                                    max={50}
                                    value={data.max_renewals}
                                    onChange={(e) => setData('max_renewals', parseInt(e.target.value, 10) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reborrow_cooldown_days">Re-borrow cooldown (days)</Label>
                                <Input
                                    id="reborrow_cooldown_days"
                                    type="number"
                                    min={0}
                                    max={365}
                                    value={data.reborrow_cooldown_days}
                                    onChange={(e) => setData('reborrow_cooldown_days', parseInt(e.target.value, 10) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reservation_hold_days">Reservation hold (days)</Label>
                                <Input
                                    id="reservation_hold_days"
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={data.reservation_hold_days}
                                    onChange={(e) => setData('reservation_hold_days', parseInt(e.target.value, 10) || 1)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fine and loan terms</CardTitle>
                            <CardDescription>Configure values separately per patron type.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="student">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="student">Students</TabsTrigger>
                                    <TabsTrigger value="employee">Employees</TabsTrigger>
                                </TabsList>
                                <TabsContent value="student">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="student_fine_per_day">Fine per day (PHP)</Label>
                                            <Input
                                                id="student_fine_per_day"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={data.student_fine_per_day}
                                                onChange={(e) =>
                                                    setData('student_fine_per_day', parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="student_max_fine">Max fine (PHP, optional)</Label>
                                            <Input
                                                id="student_max_fine"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={data.student_max_fine}
                                                onChange={(e) => setData('student_max_fine', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="student_grace_period_days">Grace period (days)</Label>
                                            <Input
                                                id="student_grace_period_days"
                                                type="number"
                                                min={0}
                                                value={data.student_grace_period_days}
                                                onChange={(e) =>
                                                    setData('student_grace_period_days', parseInt(e.target.value, 10) || 0)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="student_loan_duration_days">Default loan duration (days)</Label>
                                            <Input
                                                id="student_loan_duration_days"
                                                type="number"
                                                min={1}
                                                max={365}
                                                value={data.student_loan_duration_days}
                                                onChange={(e) =>
                                                    setData('student_loan_duration_days', parseInt(e.target.value, 10) || 1)
                                                }
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="employee">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="employee_fine_per_day">Fine per day (PHP)</Label>
                                            <Input
                                                id="employee_fine_per_day"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={data.employee_fine_per_day}
                                                onChange={(e) =>
                                                    setData('employee_fine_per_day', parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="employee_max_fine">Max fine (PHP, optional)</Label>
                                            <Input
                                                id="employee_max_fine"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={data.employee_max_fine}
                                                onChange={(e) => setData('employee_max_fine', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="employee_grace_period_days">Grace period (days)</Label>
                                            <Input
                                                id="employee_grace_period_days"
                                                type="number"
                                                min={0}
                                                value={data.employee_grace_period_days}
                                                onChange={(e) =>
                                                    setData('employee_grace_period_days', parseInt(e.target.value, 10) || 0)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="employee_loan_duration_days">Default loan duration (days)</Label>
                                            <Input
                                                id="employee_loan_duration_days"
                                                type="number"
                                                min={1}
                                                max={365}
                                                value={data.employee_loan_duration_days}
                                                onChange={(e) =>
                                                    setData('employee_loan_duration_days', parseInt(e.target.value, 10) || 1)
                                                }
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Save policy'}
                    </Button>
                </form>
            </div>
        </LibraryLayout>
    );
}
