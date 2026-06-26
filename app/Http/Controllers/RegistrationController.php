<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function choice(): Response
    {
        return Inertia::render('Register/Choice');
    }
}
