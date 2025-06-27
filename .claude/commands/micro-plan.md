# Micro Plan - Quick Task Planning (1-2 Hours)

Creates lightweight .md planning specs for small tasks, bug fixes, and quick changes.

## When to Use Micro Plan

- **Bug fixes** that affect 1-3 files
- **UI tweaks** and styling adjustments  
- **Configuration changes** and small improvements
- **Simple feature additions** (single component)
- **Quick refactoring** of specific functions/components

## Template Structure

Micro plans create focused, actionable specs with minimal overhead:

```markdown
# Micro Plan: [Task Description]

## Problem
What needs to be fixed/added/changed? (1-2 sentences)

## Approach  
How will you solve it? (1-2 sentences)

## Files to Change
- [ ] file1.tsx - what changes
- [ ] file2.ts - what changes  
- [ ] file3.css - what changes

## Context Needed
- Suggested context command: /quick-learn
- Additional context: /tech-learn (if using new patterns)

## Success Criteria
- [ ] Specific outcome 1
- [ ] Specific outcome 2

## Notes
Any gotchas, dependencies, or considerations
```

## Naming Convention

Files are created in `specs/` folder with this format:
- `YYYY-MM-DD-micro-[task-description].md`

**Examples:**
- `2025-01-15-micro-fix-search-highlighting.md`
- `2025-01-15-micro-add-loading-spinner.md`
- `2025-01-15-micro-update-category-icons.md`

## Usage Examples

### Bug Fix Example
```
Problem: Search highlighting not working on mobile
Approach: Fix CSS specificity in SearchHighlight component
Files: SearchHighlight.tsx, globals.css
Context: /quick-learn
Success: Highlighting works on all devices
```

### Small Feature Example  
```
Problem: Need "Mark as Sold" button for marketplace posts
Approach: Add status toggle in PostCard component
Files: PostCard.tsx, posts.ts (server action)
Context: /quick-learn + /features-learn
Success: Users can mark posts as sold, status updates immediately
```

### Configuration Example
```
Problem: Image upload size limit too small
Approach: Update Next.js config and Supabase settings
Files: next.config.ts, supabase policy
Context: /tech-learn
Success: Users can upload larger images (up to 5MB)
```

## Integration with Workflow

**Recommended flow:**
1. Create micro plan: `/micro-plan`
2. Load context: Use suggested context from plan
3. Implement: Follow the file checklist
4. Test: Verify success criteria
5. Commit: Reference spec in commit message

**Context suggestions:**
- Most micro tasks: `/quick-learn` only
- Technical changes: `/quick-learn` + `/tech-learn`  
- Feature-related: `/quick-learn` + `/features-learn`

## Benefits of Micro Planning

✅ **Scope clarity**: Prevents feature creep on small tasks  
✅ **Speed**: Faster to create than to think through ad-hoc  
✅ **Documentation**: Permanent record of what was changed  
✅ **Context guidance**: Optimal context loading suggestions  
✅ **Success tracking**: Clear completion criteria  

Perfect for the 60% of development work that's small, focused tasks!