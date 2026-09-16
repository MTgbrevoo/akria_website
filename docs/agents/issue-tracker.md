# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file
- Comments and conversation history append under a `## Comments` heading

## Skill operations

When publishing, create a file under `.scratch/<feature-slug>/`. When fetching a ticket, read its referenced path.

Wayfinder maps live at `.scratch/<effort>/map.md`. Child tickets live under `.scratch/<effort>/issues/`, declare `Type`, `Status`, and `Blocked by`, and are worked in numeric order when unblocked.
