# Spec Organization Guide

Complete guide for organizing and managing planning documents in the `specs/` folder.

## Tiered Planning System Overview

### 🚀 No Planning (< 1 hour)
**Action**: Just implement directly with `/quick-learn`
**Files**: No spec files created

### ⚡ Micro Planning (1-2 hours) 
**Command**: `/micro-plan`
**Files**: `YYYY-MM-DD-micro-[task-name].md`
**Use**: 60% of development work

### 📋 Quick Planning (2-8 hours)
**Command**: `/quick-spec` 
**Files**: `YYYY-MM-DD-quick-[type]-[name].md`
**Use**: 30% of development work

### 📚 Full Planning (1+ days)
**Command**: `/full-spec`
**Files**: `YYYY-MM-DD-full-[type]-[name].md`  
**Use**: 10% of development work

## File Naming Conventions

### Micro Plans
```
YYYY-MM-DD-micro-[task-description].md

Examples:
2025-01-15-micro-fix-search-highlighting.md
2025-01-15-micro-add-loading-spinner.md
2025-01-15-micro-update-mobile-nav.md
```

### Quick Specs
```
YYYY-MM-DD-quick-[type]-[name].md

Types: feature, refactor, bugfix, performance, integration

Examples:
2025-01-15-quick-feature-user-bookmarks.md
2025-01-15-quick-refactor-search-performance.md
2025-01-15-quick-bugfix-image-upload-errors.md
2025-01-15-quick-performance-database-queries.md
2025-01-15-quick-integration-payment-system.md
```

### Full Specs
```
YYYY-MM-DD-full-[type]-[name].md

Examples:
2025-01-15-full-feature-messaging-system.md
2025-01-15-full-refactor-auth-architecture.md
2025-01-15-full-bugfix-data-corruption-issue.md
```

## Folder Organization

### Current Structure
```
specs/
├── YYYY-MM-DD-micro-*.md          # Quick tasks
├── YYYY-MM-DD-quick-*.md          # Medium tasks  
├── YYYY-MM-DD-full-*.md           # Major projects
├── _template-bugfix.md            # Legacy template
├── _template-feature.md           # Legacy template
└── _template-refactor.md          # Legacy template
```

### Recommended Future Structure
```
specs/
├── active/                        # Current work
│   ├── YYYY-MM-DD-micro-*.md
│   ├── YYYY-MM-DD-quick-*.md
│   └── YYYY-MM-DD-full-*.md
├── completed/                     # Finished work
│   └── YYYY/                     # Yearly archives
│       ├── 01-january/
│       ├── 02-february/
│       └── ...
├── templates/                     # Spec templates
│   ├── micro-template.md
│   ├── quick-template.md
│   └── full-template.md
└── README.md                      # This guide
```

## Spec Status Tracking

### Status Indicators (in filename or content)

**Planning Phase:**
- `[PLANNING]` - Spec being written
- `[REVIEW]` - Awaiting review/approval

**Implementation Phase:**  
- `[IN-PROGRESS]` - Currently implementing
- `[BLOCKED]` - Waiting on dependencies

**Completion Phase:**
- `[COMPLETED]` - Successfully implemented
- `[CANCELLED]` - Work cancelled/abandoned

### Example Status Usage
```
# In filename:
2025-01-15-quick-feature-bookmarks-[IN-PROGRESS].md

# In spec content:
Status: IN-PROGRESS (as of 2025-01-15)
Progress: 
- [x] Database schema
- [x] Server actions  
- [ ] UI components
- [ ] Testing
```

## Cross-Referencing System

### Linking Specs
```markdown
## Related Work
- Depends on: [2025-01-10-quick-refactor-search-api.md]
- Blocks: [2025-01-20-micro-update-search-ui.md]
- Related: [2025-01-12-quick-feature-user-profiles.md]
```

### Linking to Project Memory
```markdown
## References
- Technical patterns: `project_memory/07_TECH_STACK_BEST_PRACTICES.md`
- Workflow guidance: `project_memory/08_DEVELOPMENT_WORKFLOW_GUIDE.md`
- Feature status: Use `/features-learn` command
```

## Maintenance Guidelines

### Weekly Cleanup
1. **Move completed specs** to `completed/YYYY/MM-month/`
2. **Archive old planning specs** that were cancelled
3. **Update cross-references** if specs were moved
4. **Clean up duplicate or outdated specs**

### Monthly Review
1. **Analyze spec usage patterns** - which types are most used?
2. **Refine templates** based on real usage
3. **Update organization system** if needed
4. **Document lessons learned**

### Quarterly Assessment
1. **Evaluate planning effectiveness** - are specs helping?
2. **Adjust tiered system** based on actual task distribution
3. **Update workflow integration** with new patterns
4. **Archive old completed work** to reduce clutter

## Integration with Development Workflow

### Planning Phase
```
1. Assess task complexity → /which-spec
2. Create appropriate spec → /micro-plan, /quick-spec, or /full-spec
3. Review and refine spec
4. Load suggested context for implementation
```

### Implementation Phase  
```
1. Reference spec during development
2. Update spec if scope changes
3. Check off completed tasks
4. Note any deviations or discoveries
```

### Completion Phase
```
1. Mark spec as completed
2. Update project memory if significant
3. Archive spec to completed folder
4. Reference spec in commit messages
```

## Quality Standards

### Good Spec Characteristics
✅ **Clear problem statement**
✅ **Actionable tasks with checkboxes**
✅ **Specific file names and changes**
✅ **Context loading guidance**
✅ **Clear success criteria**
✅ **Realistic time estimates**

### Spec Anti-Patterns
❌ **Vague requirements** - "Make it better"
❌ **No clear scope** - Endless feature creep potential  
❌ **Over-engineering** - Enterprise docs for simple tasks
❌ **No success criteria** - How do you know when done?
❌ **Wrong tier** - Full spec for 1-hour task

## Template Guidelines

### Micro Plan Template Essentials
- Problem (1-2 sentences)
- Approach (1-2 sentences)  
- Files to change (checklist)
- Success criteria (2-3 items)
- Context suggestion

### Quick Spec Template Essentials
- Problem statement (paragraph)
- Solution approach (paragraph)
- Technical plan (detailed checklist)
- Success criteria (specific outcomes)
- Testing plan (key scenarios)
- Context guidance

### Full Spec Template Essentials
- Comprehensive problem analysis
- Multiple solution approaches considered
- Detailed technical design
- Risk assessment and mitigation
- Phased implementation plan
- Thorough testing strategy
- Rollout and rollback plans

## Success Metrics

### Planning Effectiveness
- **Scope accuracy**: Did the work stay within planned scope?
- **Time accuracy**: Was the estimate reasonably close?
- **Quality outcomes**: Were success criteria met?
- **Rework needed**: How much additional work was required?

### System Usage
- **Adoption rate**: Are specs being created consistently?
- **Tier distribution**: Is the 60/30/10 split realistic?
- **Template effectiveness**: Are templates being followed?
- **Workflow integration**: Does this speed up or slow down development?

The goal is a planning system that genuinely helps you work more effectively, not one that creates bureaucratic overhead!