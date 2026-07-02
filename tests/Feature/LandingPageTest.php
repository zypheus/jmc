<?php

namespace Tests\Feature;

use Tests\TestCase;

class LandingPageTest extends TestCase
{
    public function test_landing_page_renders_mobile_navigation_toggle(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertSee('id="landingNavToggle"', false)
            ->assertSee('aria-controls="landingNav"', false)
            ->assertSee('id="landingNav"', false)
            ->assertSee('ROOM RESERVATIONS');
    }
}
