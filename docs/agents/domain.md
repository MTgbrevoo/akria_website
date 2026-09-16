# Domain Docs

Before exploring the codebase, read:

- `CONTEXT.md` at the repository root
- Relevant ADRs under `docs/adr/`

If these files do not exist, proceed silently. Domain-modeling skills create them lazily when terminology or decisions are resolved.

This is a single-context repository:

```
/
|-- CONTEXT.md
|-- docs/adr/
`-- src/
```

Use terminology exactly as defined in `CONTEXT.md`. If required vocabulary is missing, reconsider the term or record the gap for domain modeling.

Surface conflicts with existing ADRs explicitly rather than silently overriding them.
