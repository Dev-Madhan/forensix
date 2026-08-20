# Criminal Eye --- Typography System

## Official Font Pairing

Criminal Eye uses a two-font typography system:

-   **Inter** --- primary UI and interface font
-   **Source Serif 4** --- secondary editorial/investigative font

The goal is to make Criminal Eye feel professional, trustworthy,
human-designed, and appropriate for a forensic investigation platform
rather than a generic AI/SaaS product.

------------------------------------------------------------------------

## 1. Font Roles

### Inter --- Primary Font

Use **Inter** for almost all application interface content.

Use it for:

-   Navigation
-   Sidebar items
-   Buttons
-   Form labels
-   Input fields
-   Placeholders
-   Tables
-   Dashboard statistics
-   Case metadata
-   Criminal database records
-   Recognition results
-   Status badges
-   Filters
-   Search
-   Notifications
-   Tooltips
-   Body text
-   Supporting descriptions
-   Empty states
-   Error messages
-   Confirmation dialogs

### Source Serif 4 --- Secondary Font

Use **Source Serif 4** selectively for content that benefits from an
investigative, editorial, or document-oriented character.

Use it for:

-   Major investigation titles
-   Investigation/report headings
-   Witness statements
-   Evidence descriptions
-   Narrative case summaries
-   Long-form investigative notes
-   Important quotations
-   PDF report headings
-   Selected hero/landing-page headings

**Do not use Source Serif 4 for normal UI controls, navigation, tables,
or dense dashboard data.**

------------------------------------------------------------------------

# 2. Typography Hierarchy

All measurements below are in `px`.

  Element                 Font               Weight   Size   Line Height
  ----------------------- ---------------- -------- ------ -------------
  Main page title         Inter                 600   32px          40px
  Large page title        Source Serif 4        600   40px          48px
  Section heading         Inter                 600   24px          32px
  Investigation heading   Source Serif 4        600   28px          36px
  Card heading            Inter                 600   18px          26px
  Body text               Inter                 400   15px          24px
  Secondary text          Inter                 400   14px          20px
  Small text              Inter                 400   13px          18px
  Form label              Inter                 500   13px          18px
  Button                  Inter                 500   14px          20px
  Table text              Inter                 400   14px          20px
  Statistic               Inter                 600   28px          34px
  Witness statement       Source Serif 4        400   18px          30px
  Report body             Source Serif 4        400   16px          26px
  Case ID                 Inter                 500   13px          18px

------------------------------------------------------------------------

# 3. Weight Rules

Keep the weight system restrained.

## Inter

Preferred weights:

-   `400` --- regular/body
-   `500` --- labels, buttons, navigation
-   `600` --- headings, important values
-   `700` --- rare emphasis only

Avoid using `700` everywhere.

## Source Serif 4

Preferred weights:

-   `400` --- narrative text and statements
-   `500` --- subtle emphasis
-   `600` --- major investigative headings

Avoid heavy serif typography in dense UI.

------------------------------------------------------------------------

# 4. Where Each Font Goes

## Dashboard

Use **Inter** for:

-   Dashboard title
-   Statistics
-   Cards
-   Navigation
-   Recent cases
-   Recognition results
-   Activity feed

Example:

``` text
Investigation Overview

24
ACTIVE CASES

08
PENDING ANALYSIS

137
CRIMINAL RECORDS
```

Do not use Source Serif 4 for the dashboard's normal data.

------------------------------------------------------------------------

## Case Management

Use **Inter** for:

-   Case ID
-   Case status
-   Investigator
-   Date
-   Location
-   Actions
-   Filters
-   Tables

Use **Source Serif 4** for:

-   Investigation summary
-   Witness statement
-   Narrative case description

Example:

``` text
CASE #CE-2026-0042

Investigation Summary

The witness reported seeing an individual...
```

The heading and interface remain clean, while the narrative can use
Source Serif 4.

------------------------------------------------------------------------

## Witness Processing

Use **Inter** for:

-   Form labels
-   Text areas
-   Buttons
-   AI processing status
-   Facial attributes
-   Generated results

Use **Source Serif 4** for the actual witness statement when it is
presented as an investigative narrative.

------------------------------------------------------------------------

## Facial Recognition

Use **Inter** for:

-   Match percentage
-   Suspect name
-   Criminal ID
-   Confidence
-   Ranking
-   Match status
-   Action buttons

Example:

``` text
Potential Match

94.82%
HIGH CONFIDENCE

Criminal ID: CR-004291
```

Keep recognition results highly readable and data-focused.

------------------------------------------------------------------------

## Investigation Reports

This is where Source Serif 4 should have the strongest presence.

Use:

-   **Inter** for metadata, labels, IDs, dates, tables and technical
    information.
-   **Source Serif 4** for report headings, narrative summaries, witness
    statements and long-form investigation content.

This creates a document-like investigative feel without making the web
application look old-fashioned.

------------------------------------------------------------------------

# 5. Landing Page

If Criminal Eye has a public landing page:

### Hero heading

Use **Source Serif 4**.

Example:

> Intelligence for Modern Investigations

### Supporting text

Use **Inter**.

### CTA buttons

Use **Inter**.

### Feature cards

Use **Inter**.

### Editorial/investigative sections

Source Serif 4 may be used for selected large headings or quotes.

Do not turn the entire landing page into a serif design.

------------------------------------------------------------------------

# 6. Navigation and Sidebar

Always use **Inter**.

Recommended:

-   Font size: `14px`
-   Weight: `500`
-   Line height: `20px`

Example:

``` text
Dashboard
Cases
Criminal Database
Witnesses
Recognition
Reports
Audit Logs
Settings
```

Never use Source Serif 4 for navigation.

------------------------------------------------------------------------

# 7. Forms

Forms should use **Inter** exclusively.

### Label

`13px / 500`

### Input

`14px / 400`

### Placeholder

`14px / 400`

### Helper text

`13px / 400`

### Button

`14px / 500`

This keeps the interface professional and easy to scan.

------------------------------------------------------------------------

# 8. Tables

Use **Inter** exclusively.

Recommended:

-   Header: `13px / 500`
-   Body: `14px / 400`
-   Row height: approximately `48px–56px`

Tables contain high-density information, so serif typography should not
be used here.

------------------------------------------------------------------------

# 9. Status and Metadata

Use **Inter**.

Examples:

``` text
ACTIVE
PENDING
UNDER REVIEW
COMPLETED
ARCHIVED
```

Do not use decorative typography for system states.

------------------------------------------------------------------------

# 10. AI Results

The AI should be visually presented as a professional investigation
tool, not as a flashy AI chatbot.

Use **Inter** for:

-   Processing states
-   Confidence scores
-   Match rankings
-   Facial attributes
-   Model status
-   Generated result metadata

Use Source Serif 4 only when displaying narrative content derived from a
witness or investigation report.

Avoid:

-   Huge futuristic headings
-   Excessive gradient text
-   Overly rounded typography
-   Decorative AI-style text effects

------------------------------------------------------------------------

# 11. PDF Investigation Reports

Use a mixed typography system.

### Metadata

Inter

``` text
CASE ID: CE-2026-0042
DATE: 20 AUGUST 2026
INVESTIGATOR: ...
STATUS: ACTIVE
```

### Report title

Source Serif 4

``` text
Investigation Report
```

### Narrative

Source Serif 4

### Tables

Inter

### Technical results

Inter

This creates a professional investigative-document appearance.

------------------------------------------------------------------------

# 12. Font Installation in Next.js

Use Next.js `next/font/google`.

In the root layout:

``` tsx
import { Inter, Source_Serif_4 } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});
```

Apply both variables to the `<body>`:

``` tsx
<body className={`${inter.variable} ${sourceSerif.variable}`}>
  {children}
</body>
```

------------------------------------------------------------------------

# 13. Tailwind Usage

Use the CSS variables as the project's font tokens.

Example:

``` css
:root {
  --font-ui: var(--font-inter);
  --font-editorial: var(--font-source-serif);
}
```

Then define:

``` css
.font-ui {
  font-family: var(--font-ui);
}

.font-editorial {
  font-family: var(--font-editorial);
}
```

Recommended convention:

``` tsx
<h1 className="font-ui">
  Investigation Overview
</h1>

<p className="font-editorial">
  The witness described the individual as...
</p>
```

If the project's Tailwind configuration provides custom font-family
tokens, map `ui` to Inter and `editorial` to Source Serif 4.

------------------------------------------------------------------------

# 14. Component Rules

### Buttons

``` text
Inter / 14px / 500
```

### Cards

``` text
Heading: Inter / 18px / 600
Body: Inter / 14–15px / 400
```

### Dialogs

``` text
Title: Inter / 18px / 600
Body: Inter / 14px / 400
```

### Tables

``` text
Inter only
```

### Forms

``` text
Inter only
```

### Investigation narrative

``` text
Source Serif 4 / 18px / 400
```

### Reports

``` text
Source Serif 4 for narrative
Inter for metadata and structured information
```

------------------------------------------------------------------------

# 15. Design Principle

Criminal Eye should **not look like an AI-generated interface**.

Avoid making typography unnecessarily futuristic.

The visual hierarchy should communicate:

``` text
INTER
↓
Professional software

SOURCE SERIF 4
↓
Investigation / evidence / narrative

Together
↓
Professional + trustworthy + human-designed
```

The project should feel like a serious forensic investigation platform
that uses AI---not an AI product trying to look futuristic.

------------------------------------------------------------------------

# 16. Golden Rule

When deciding which font to use for a new component:

### Is it UI or structured data?

Use **Inter**.

### Is it investigative narrative or document content?

Use **Source Serif 4**.

### Is it both?

Use Inter for the interface and Source Serif 4 only for the narrative
portion.

When in doubt, choose **Inter**.

------------------------------------------------------------------------

# 17. Do Not Change the Pairing

This typography system should remain consistent across:

-   Dashboard
-   Case Management
-   Criminal Database
-   Witness Processing
-   Sketch Generation
-   Facial Recognition
-   Recognition Results
-   Reports
-   Audit Logs
-   Settings
-   Authentication
-   Landing Page

Do not introduce additional display fonts.

Do not use a different font for individual pages.

Do not use decorative fonts.

The only exception is a future requirement for a specialized
technical/monospace font in code-like or system-log content.

------------------------------------------------------------------------

## Final Typography Decision

**Primary:** Inter

**Secondary:** Source Serif 4

**Design personality:** Professional · Investigative · Trustworthy ·
Human · Precise

**Core rule:** Inter handles the application. Source Serif 4 handles the
investigation narrative.

This is the official Criminal Eye typography system and should be
treated as a project-level design rule.
