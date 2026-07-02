# JMC Design System

## Direction

JMC is a restrained, light institutional product interface used in administrative offices, public library stations, and attendance kiosks. It should feel trustworthy, efficient, and welcoming. Familiar controls, strong hierarchy, and visible system status take priority over decoration.

## Color

- Core surfaces use the semantic shadcn tokens in `resources/css/app.css`: `background`, `card`, `muted`, `foreground`, `border`, and `ring`.
- JMC blue is the primary action and focus color. Green identifies attendance, gold identifies library context, and navy anchors the intentionally dark kiosk surface.
- Success, warning, danger, and information use their semantic status tokens. Status meaning must also be written as text or represented by an accessible icon; color is never the only cue.
- Gradients, decorative transparency, glass blur, and colored side stripes are not part of the system.

## Typography

- Source Sans 3 is the product UI family for body copy, labels, controls, tables, and navigation.
- Poppins is reserved for public or kiosk headings and may not be used for button labels or dense administrative data.
- Headings use a compact fixed scale and balanced wrapping. Prose should remain within roughly 65–75 characters per line.

## Components

- Use components in `resources/js/components/ui` before creating a new primitive.
- Radix Dialog and DropdownMenu own modal and menu focus behavior.
- Every form field has a persistent visible label, stable ID, required state, and associated description/error text. Invalid submissions focus the first invalid field.
- Tables use the shared responsive table container. Dense data may scroll horizontally inside its region; the page itself must not overflow.
- Buttons and fields retain compact desktop density and reach a minimum 44px target on coarse pointers.
- Cards are reserved for genuinely grouped content. Prefer sections, dividers, and definition lists for summaries.

## Layout and Navigation

- Administrative pages use clear page headings, compact filters, responsive data regions, and wrapping action groups.
- Attendance, library, and OPAC share one component vocabulary while retaining restrained module accents.
- Active navigation uses a filled or outlined state, never a colored side stripe.

## Motion

- Motion communicates state and stays within 150–250ms.
- Animate color, opacity, or transform only; never animate layout dimensions.
- All motion has a reduced-motion path. Product content is visible without waiting for an entrance animation.

## Accessibility

- Target WCAG 2.2 AA.
- Maintain complete keyboard operation, visible focus, semantic landmarks, descriptive names, live status announcements, and sufficient text/non-text contrast.
- Dialogs trap and restore focus. Menus support standard arrow-key, Enter, and Escape behavior.
