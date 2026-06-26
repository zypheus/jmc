@extends('layouts.sec')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
@endsection

@section('content')
<div class="patron-dir">
    <header class="patron-dir__hero">
        <div>
            <p class="patron-dir__eyebrow">Patron data</p>
            <h1 class="patron-dir__title">{{ $student->lastname }}, {{ $student->firstname }}</h1>
            <p class="patron-dir__subtitle">Student patron record</p>
        </div>
        <div class="patron-dir__hero-actions">
            <a href="{{ route('library.students.edit', $student->id) }}" class="patron-dir__btn patron-dir__btn--primary">Edit</a>
            <a href="{{ route('library.students.index') }}" class="patron-dir__btn patron-dir__btn--outline">← Student directory</a>
        </div>
    </header>

    <div class="patron-dir__card p-4">
        <dl class="row mb-0">
            <dt class="col-sm-3">ID number</dt>
            <dd class="col-sm-9">{{ $student->id_number ?: '—' }}</dd>
            <dt class="col-sm-3">Course</dt>
            <dd class="col-sm-9">{{ $student->course ?: '—' }}</dd>
            <dt class="col-sm-3">Year</dt>
            <dd class="col-sm-9">{{ $student->year ?: '—' }}</dd>
            <dt class="col-sm-3">QR code</dt>
            <dd class="col-sm-9">{{ $student->qrcode ?: '—' }}</dd>
            <dt class="col-sm-3">Email</dt>
            <dd class="col-sm-9">{{ $student->email ?: '—' }}</dd>
            <dt class="col-sm-3">Mobile</dt>
            <dd class="col-sm-9">{{ $student->mobile_number ?: '—' }}</dd>
        </dl>
    </div>
</div>
@endsection
