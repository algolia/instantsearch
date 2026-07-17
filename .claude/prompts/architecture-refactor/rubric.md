# Architecture Refactor Rubric

Use this rubric to find and implement refactors that deepen modules.

## Vocabulary

Use these terms exactly:

- Module: anything with an interface and an implementation.
- Interface: everything a caller must know to use the module correctly, including invariants, ordering constraints, error modes, required configuration, and performance characteristics.
- Implementation: what sits inside a module.
- Depth: leverage at the interface. A module is deep when a lot of behavior sits behind a small interface.
- Seam: where a module's interface lives, and where behavior can vary without editing the caller.
- Adapter: a concrete thing that satisfies an interface at a seam.
- Leverage: more capability per unit of interface a caller needs to learn.
- Locality: change, bugs, knowledge, and verification concentrate in one place.

Avoid using "component", "service", "API", or "boundary" when one of the terms above is the more precise architecture word.

## What To Look For

- Understanding one concept requires bouncing between many small modules.
- A module is shallow: its interface is nearly as complex as its implementation.
- Logic was extracted into pure functions only for testability, but the real bugs live in orchestration.
- Callers know too much about ordering, defaults, normalization, or error modes.
- Tests need to reach past the current interface to verify behavior.
- Coupled modules leak knowledge across their seams.

Apply the deletion test: if deleting the module makes complexity vanish, it was probably pass-through. If deleting it spreads complexity across callers, the module may be earning its keep.

## Constraints

- Prefer small, reviewable refactors.
- Do not propose speculative abstractions.
- Do not introduce a seam unless something actually varies across it, or tests need a clean adapter at that seam.
- The interface should be the natural test surface.
- One candidate should map to one future PR.
- Keep proposals grounded in files and caller behavior, not broad architecture essays.
