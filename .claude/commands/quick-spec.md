# Quick Spec - Medium Task Planning (2-8 Hours)

Creates focused .md planning specs for small features, refactoring, and complex bug fixes.

## When to Use Quick Spec

- **Small to medium features** (2-5 components affected)
- **Refactoring work** that touches multiple files
- **Complex bug fixes** requiring investigation
- **Integration tasks** (adding new libraries, APIs)
- **Performance optimizations** with measurable impact
- **UI/UX improvements** across multiple components

## Template Structure

Quick specs provide structured planning without enterprise overhead:

```markdown
# Quick Spec: [Feature/Refactor/BugFix] - [Name]

## Problem Statement
What user problem are we solving? Why is this needed? (2-3 sentences)

## Solution Approach
High-level approach to solving the problem (2-3 sentences)

## Technical Plan

### Components Affected
- [ ] Component1.tsx - specific changes needed
- [ ] Component2.tsx - specific changes needed  
- [ ] utils/helper.ts - new utility functions
- [ ] types/index.ts - type definitions

### Database Changes (if applicable)
- [ ] New table/columns needed
- [ ] Migration script required
- [ ] RLS policy updates

### New Dependencies (if applicable)  
- [ ] npm package: purpose
- [ ] Configuration needed

## Implementation Tasks

### Phase 1: Foundation
- [ ] Task 1 - setup/preparation
- [ ] Task 2 - core infrastructure

### Phase 2: Core Implementation  
- [ ] Task 3 - main feature logic
- [ ] Task 4 - UI components

### Phase 3: Integration & Testing
- [ ] Task 5 - connect pieces
- [ ] Task 6 - testing and refinement

## Context Needed
- Start with: /quick-learn + /features-learn
- Technical reference: /tech-learn (if using new patterns)
- Full context: /full-learn (if touching core architecture)

## Success Criteria
- [ ] Functional requirement 1
- [ ] Functional requirement 2  
- [ ] Performance/quality requirement
- [ ] User experience requirement

## Testing Plan
- [ ] Manual testing scenarios
- [ ] Playwright tests to add/update
- [ ] Edge cases to verify

## Rollout Considerations
- [ ] Feature flag needed?
- [ ] Gradual rollout approach
- [ ] Rollback plan if issues

## Notes & Considerations
Any gotchas, dependencies, or architectural considerations
```

## Naming Convention

Files are created in `specs/` folder with this format:
- `YYYY-MM-DD-quick-feature-[name].md` - for new features
- `YYYY-MM-DD-quick-refactor-[name].md` - for refactoring work  
- `YYYY-MM-DD-quick-bugfix-[name].md` - for complex bugs

**Examples:**
- `2025-01-15-quick-feature-user-bookmarks.md`
- `2025-01-15-quick-refactor-search-performance.md`
- `2025-01-15-quick-bugfix-image-upload-errors.md`

## Template Variations

### Feature Spec Template
```markdown
# Quick Spec: Feature - [Feature Name]

## User Story
As a [user type], I want [functionality] so that [benefit].

## Acceptance Criteria
- [ ] User can do X
- [ ] System behaves Y when Z
- [ ] Error handling for edge case A

## Technical Implementation
[Use standard template structure]

## User Experience Considerations
- Mobile responsiveness requirements
- Accessibility considerations  
- Performance expectations
```

### Refactor Spec Template
```markdown
# Quick Spec: Refactor - [Area Being Refactored]

## Current Problems
- Technical debt issue 1
- Maintenance pain point 2
- Performance issue 3

## Target State
- Improved maintainability through X
- Better performance via Y
- Cleaner architecture using Z

## Migration Strategy
- [ ] Phase 1: Add new implementation alongside old
- [ ] Phase 2: Migrate consumers to new implementation
- [ ] Phase 3: Remove old implementation

[Use standard template structure for technical details]
```

### Bug Fix Spec Template
```markdown
# Quick Spec: Bug Fix - [Bug Description]

## Bug Details
**Symptoms:** What users experience
**Reproduction:** Step-by-step reproduction
**Impact:** User/business impact (severity/frequency)

## Root Cause Analysis
**Investigation findings:** What debugging revealed
**Root cause:** The underlying issue
**Why it happened:** Contributing factors

## Fix Strategy
**Approach:** How to fix the core issue
**Side effects:** What else might be affected
**Prevention:** How to avoid similar bugs

[Use standard template structure for implementation]
```

## Integration with Workflow

**Recommended flow:**
1. Create quick spec: `/quick-spec`
2. Review scope and approach (validate with others if needed)
3. Load context: Use suggested context from plan
4. Implement phase by phase: Follow task checklist
5. Test thoroughly: Complete testing plan
6. Document and deploy: Update relevant docs
7. Mark complete: Reference spec in commit

**Context loading guidance:**
- **Feature work**: `/quick-learn` + `/features-learn`
- **Refactoring**: `/quick-learn` + `/tech-learn`
- **Bug fixes**: `/quick-learn` + `/status-learn`
- **Complex work**: `/full-learn` if touching core systems

## Benefits of Quick Specs

✅ **Right-sized planning**: Enough detail without overhead  
✅ **Clear scope**: Prevents scope creep and feature bloat  
✅ **Phased approach**: Breaking work into manageable chunks  
✅ **Success tracking**: Clear completion and quality criteria  
✅ **Context optimization**: Guidance for efficient context loading  
✅ **Testing focus**: Structured approach to quality assurance  

Perfect for the 30% of development work that's substantial but not massive!