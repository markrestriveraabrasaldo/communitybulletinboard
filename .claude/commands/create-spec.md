# Create Spec - Planning Document Generator

This command helps create structured planning documents for new features, refactoring, or complex changes before implementation.

## When to Create a Spec

- **New Features**: Any feature that requires multiple components or database changes
- **Major Refactoring**: Significant architectural changes
- **Complex Bug Fixes**: Issues requiring multiple file changes
- **Integration Work**: Adding new external services or APIs

## Spec Templates Available

### 1. Feature Specification (`YYYY-MM-DD-feature-name.md`)

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

### 2. Refactoring Specification (`YYYY-MM-DD-refactor-name.md`)

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

### 3. Bug Fix Specification (`YYYY-MM-DD-bugfix-name.md`)

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

## Naming Convention

Use this format for spec file names:
- `YYYY-MM-DD-feature-comments-system.md`
- `YYYY-MM-DD-refactor-auth-context.md`
- `YYYY-MM-DD-bugfix-image-upload.md`

## Spec Workflow

1. **Create Spec**: Plan the work thoroughly
2. **Review & Approve**: Get feedback before implementation
3. **Implement**: Follow the spec during development
4. **Update Spec**: Modify if discoveries require changes
5. **Complete**: Mark spec as implemented in roadmap

## Current Project Context

**Existing Architecture**: Next.js App Router, Server Actions, Supabase  
**Recent Patterns**: Server Components, useActionState, Zod validation  
**Code Quality**: High - clean, typed, well-structured  
**Testing**: Playwright for E2E, could use more unit tests  

## Example Spec Ideas for Current Project

### Potential New Features
- **Comments System**: User commenting on posts
- **Notification System**: In-app notifications for activity
- **Real-time Updates**: Live updates using Supabase Realtime
- **User Ratings**: Rating system for service providers
- **Private Messaging**: Direct communication between users

### Potential Refactoring
- **Component Library**: Standardize common UI components
- **Error Handling**: Centralized error management system
- **Performance**: Optimize image loading and caching
- **Testing**: Add comprehensive unit test coverage

Creating a spec before major work ensures better planning, clearer communication, and more successful implementations.