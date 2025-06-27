# Full Spec - Comprehensive Planning (1+ Days)

⚠️ **NOTICE**: This command is now part of a tiered planning system!

## Choose the Right Planning Level

**For most tasks, use these optimized commands:**
- `/micro-plan` - Quick tasks (1-2 hours) 
- `/quick-spec` - Medium tasks (2-8 hours)
- `/which-spec` - Decision helper

**Use `/full-spec` (this command) only for:**
- **Major Features**: Complex functionality requiring extensive planning
- **Architecture Changes**: Core system modifications
- **High-Risk Projects**: Significant user or business impact
- **Multi-day Projects**: Work requiring comprehensive documentation

---

## Full Spec Templates (For Major Work Only)

### 1. Major Feature Specification (`YYYY-MM-DD-full-feature-name.md`)

**Use for**: New functionality that adds value to users

**Template Structure**:
```markdown
# Feature Spec: [Feature Name]

## Overview
**Problem**: What user problem does this solve?
**Solution**: High-level approach to solving it
**Impact**: Expected user/business value

## Requirements
### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Non-Functional Requirements
- [ ] Performance targets
- [ ] Security considerations
- [ ] Accessibility needs

## Technical Design
### Database Changes
- Tables to add/modify
- Migration scripts needed

### Components Affected
- List of files/components to change
- New components to create

### API Changes
- New Server Actions needed
- Modified endpoints

## Implementation Plan
### Phase 1: Foundation
- [ ] Task 1
- [ ] Task 2

### Phase 2: Core Feature
- [ ] Task 3
- [ ] Task 4

### Phase 3: Polish & Testing
- [ ] Task 5
- [ ] Task 6

## Testing Strategy
- Unit tests needed
- Integration test scenarios
- Manual testing checklist

## Rollout Plan
- Feature flags needed?
- Gradual rollout strategy
- Rollback plan

## Success Metrics
- How to measure success
- Key performance indicators
```

### 2. Major Refactoring Specification (`YYYY-MM-DD-full-refactor-name.md`)

**Use for**: Architectural improvements or code modernization

**Template Structure**:
```markdown
# Refactoring Spec: [Refactor Name]

## Current State
**Problems**: What issues exist with current code?
**Technical Debt**: Specific debt items being addressed
**Maintenance Issues**: Pain points for developers

## Target State
**Vision**: What will the code look like after refactoring?
**Benefits**: Improved maintainability, performance, etc.
**Patterns**: New patterns or architectures to adopt

## Risk Assessment
### High Risk Areas
- Components that could break
- User-facing changes

### Mitigation Strategies
- Testing approach
- Rollback plan
- Progressive implementation

## Implementation Steps
### Phase 1: Preparation
- [ ] Add comprehensive tests
- [ ] Create feature flags if needed

### Phase 2: Core Changes
- [ ] Refactor component 1
- [ ] Update dependencies

### Phase 3: Cleanup
- [ ] Remove old code
- [ ] Update documentation

## Validation Plan
- Performance benchmarks
- Functional testing
- User acceptance criteria
```

### 3. Complex Bug Fix Specification (`YYYY-MM-DD-full-bugfix-name.md`)

**Use for**: Complex bugs affecting multiple systems

**Template Structure**:
```markdown
# Bug Fix Spec: [Bug Description]

## Problem Description
**Symptoms**: What users are experiencing
**Reproduction Steps**: How to reproduce the bug
**Impact**: How many users affected, severity level

## Root Cause Analysis
**Investigation**: What debugging was done?
**Root Cause**: Underlying issue causing the bug
**Contributing Factors**: What made this bug possible?

## Solution Design
**Approach**: How will the bug be fixed?
**Side Effects**: What else might be affected?
**Alternative Solutions**: Other approaches considered

## Implementation Plan
- [ ] Fix core issue
- [ ] Add tests to prevent regression
- [ ] Update error handling
- [ ] Add monitoring/logging

## Testing Strategy
- Regression test scenarios
- Edge case validation
- Performance impact assessment

## Prevention
- Code review focus areas
- Additional tests needed
- Process improvements
```

## Naming Convention for Full Specs

Use this format for comprehensive spec file names:
- `YYYY-MM-DD-full-feature-comments-system.md`
- `YYYY-MM-DD-full-refactor-auth-context.md`
- `YYYY-MM-DD-full-bugfix-complex-authentication.md`

**Note**: Simple tasks should use `/micro-plan` or `/quick-spec` instead!

## Spec Workflow

1. **Create Spec**: Plan the work thoroughly
2. **Review & Approve**: Get feedback before implementation
3. **Implement**: Follow the spec during development
4. **Update Spec**: Modify if discoveries require changes
5. **Complete**: Mark spec as implemented in roadmap

## Context Recommendations for Full Specs

**When creating comprehensive specs:**
- **Always start with**: `/full-learn` for complete project context
- **Reference**: `project_memory/07_TECH_STACK_BEST_PRACTICES.md` for technical patterns
- **Consider**: `project_memory/08_DEVELOPMENT_WORKFLOW_GUIDE.md` for workflow optimization

## Reminder: Choose the Right Tool

**Remember**: 90% of development work can use lighter planning approaches:

### Quick Decision Guide
- **1-2 hours** → `/micro-plan` (lightweight .md spec)
- **2-8 hours** → `/quick-spec` (focused .md planning)  
- **1+ days** → `/full-spec` (this comprehensive approach)
- **Unsure?** → `/which-spec` (decision helper)

## Integration with Optimized Workflow

Full specs are designed for the 10% of work that truly needs comprehensive planning. For daily development efficiency, use the tiered system to match planning effort to task complexity.

**The goal**: Right-sized planning that helps you succeed without slowing you down!