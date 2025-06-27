# Development Workflow Guide - Effective Claude Code Utilization

This guide documents optimal patterns for maximizing development efficiency and minimizing credit usage when working with Claude Code on the Community Bulletin Board project.

## Table of Contents
1. [Optimized Context Loading](#optimized-context-loading)
2. [Task-Specific Workflows](#task-specific-workflows)
3. [Credit Efficiency Strategies](#credit-efficiency-strategies)
4. [Effective Utilization Patterns](#effective-utilization-patterns)
5. [Advanced Workflow Tips](#advanced-workflow-tips)

---

## Optimized Context Loading

### **The New Tiered System**

**Available Commands & Token Costs:**
- `/quick-learn` - 185 tokens (essential context, 80% savings)
- `/status-learn` - ~250 tokens (current progress & recent changes)
- `/tech-learn` - ~200 tokens (technical patterns & best practices)
- `/features-learn` - ~300 tokens (complete feature breakdown)
- `/full-learn` - 960 tokens (comprehensive context)

### **Decision Tree for Context Loading**

```
Need Context? 
├── Simple bug fix → /quick-learn (185 tokens)
├── New feature planning → /quick-learn + /features-learn (485 tokens)
├── Technical implementation → /quick-learn + /tech-learn (385 tokens)
├── Status questions → /status-learn (250 tokens)
└── Major architecture work → /full-learn (960 tokens)
```

### **Your Current vs Optimized Pattern**

**Previous Pattern:**
```bash
/clear → /learn (960 tokens) → work → commit
Cost per task: 960 tokens
5 tasks: 4,800 tokens
```

**Optimized Pattern:**
```bash
/clear → /quick-learn (185 tokens) → work → commit  
Cost per task: 185 tokens
5 tasks: 925 tokens
Savings: 80% reduction
```

---

## Task-Specific Workflows

### **🐛 Bug Fixes (Most Common)**

**Recommended Flow:**
```
1. /clear (fresh start)
2. /quick-learn (get current context)
3. Describe the bug clearly
4. Work on fix with incremental validation
5. Test the fix
6. Commit & push
```

**Best Practices:**
- Start with clear bug description
- Ask for validation before major changes
- Include test verification
- Update documentation if needed

**Example Session:**
```
"I found a bug where search results aren't highlighting properly. 
Let me /quick-learn first, then show you the issue."
```

### **✨ New Features**

**Recommended Flow:**
```
1. /clear
2. /quick-learn (essential context)
3. /features-learn (understand existing features)
4. Plan the feature approach
5. Implement incrementally
6. Test thoroughly
7. Update documentation
8. Commit & push
```

**Best Practices:**
- Plan before coding
- Consider existing patterns
- Think about mobile/responsive design
- Add proper error handling
- Follow established TypeScript patterns

**Example Session:**
```
"I want to add a 'bookmark posts' feature. Let me load context 
and we can plan the implementation approach."
```

### **🏗 Architecture & Refactoring**

**Recommended Flow:**
```
1. /clear  
2. /full-learn (comprehensive context needed)
3. /tech-learn (if implementing new patterns)
4. Plan the changes carefully
5. Implement with proper testing
6. Update documentation
7. Commit & push
```

**Best Practices:**
- Use full context for complex changes
- Plan breaking changes carefully
- Consider backward compatibility
- Update type definitions
- Test thoroughly across browsers

### **⚡ Performance Optimization**

**Recommended Flow:**
```
1. /clear
2. /quick-learn + /tech-learn
3. Identify performance bottlenecks
4. Plan optimization strategy
5. Implement changes
6. Measure performance impact
7. Update best practices if needed
8. Commit & push
```

### **🔒 Security Fixes**

**Recommended Flow:**
```
1. /clear
2. /full-learn (need comprehensive context)
3. Assess security implications
4. Plan fix carefully
5. Implement with proper validation
6. Test security measures
7. Update security documentation
8. Commit & push
```

---

## Credit Efficiency Strategies

### **80/20 Rule Application**

**80% of tasks** can use `/quick-learn` efficiently:
- Simple bug fixes
- Minor feature additions
- UI adjustments
- Content updates
- Configuration changes

**20% of tasks** need comprehensive context:
- Major architecture changes
- Complex debugging
- Security implementations
- Performance overhauls
- Integration work

### **Token Optimization Techniques**

**1. Smart Context Loading:**
```
Instead of: /clear → /full-learn every time
Use: /clear → /quick-learn → add specific context as needed
```

**2. Context Persistence:**
```
For related tasks: Keep context, don't /clear between every task
For unrelated tasks: /clear for fresh start
```

**3. Modular Context:**
```
Technical question? → /tech-learn only
Status question? → /status-learn only  
Feature planning? → /features-learn only
```

### **Cost Analysis Examples**

**Development Session (5 tasks):**

**Old Pattern:**
- 5 × (/clear + /full-learn) = 5 × 960 = 4,800 tokens

**Optimized Mixed Pattern:**
- 3 × (/clear + /quick-learn) = 3 × 185 = 555 tokens
- 1 × (/clear + /features-learn) = 1 × 300 = 300 tokens  
- 1 × (/clear + /full-learn) = 1 × 960 = 960 tokens
- **Total: 1,815 tokens (62% savings)**

**Aggressive Optimization:**
- 5 × (/clear + /quick-learn) = 5 × 185 = 925 tokens
- **Total: 925 tokens (80% savings)**

---

## Effective Utilization Patterns

### **Pre-Work Preparation**

**1. Clear Objectives:**
```
Good: "Fix the search highlighting bug in PostCard component"
Bad: "Something's wrong with search"
```

**2. Context Assessment:**
```
Ask yourself:
- Is this a simple fix or complex change?
- Do I need technical reference?
- Am I familiar with the current codebase state?
- Will this touch multiple systems?
```

**3. Scope Definition:**
```
- Time constraints: "Quick 30-minute fix"
- Impact scope: "This only affects the search feature"  
- Dependencies: "This might require database changes"
```

### **During Development**

**1. Incremental Updates:**
```
✅ "I've identified the issue in SearchHighlight.tsx line 23"
✅ "The fix is working, but I want to add proper error handling"
✅ "Ready for you to review before I commit"
```

**2. Validation Points:**
```
- Before major changes: "Does this approach look right?"
- After implementation: "Can you review this solution?"
- Before commit: "Does the commit message capture this properly?"
```

**3. Documentation As You Go:**
```
- Update relevant comments
- Add new patterns to best practices
- Note any gotchas for future reference
```

### **Post-Completion**

**1. Commit Review:**
```
- Have Claude review commit message
- Ensure all changes are included
- Verify no debugging code left behind
```

**2. Documentation Updates:**
```
- Update project memory if significant
- Add new patterns to workflow guide
- Note any lessons learned
```

**3. Next Steps Planning:**
```
- Identify follow-up work
- Note any technical debt created
- Plan related improvements
```

---

## Advanced Workflow Tips

### **Session Planning Strategy**

**Start of Development Day:**
```
1. /clear (fresh start)
2. /quick-learn (orient to current state)  
3. List planned tasks
4. Prioritize by complexity
5. Load appropriate context per task
```

**Example Planning Session:**
```
"Today I want to:
1. Fix search highlighting bug (simple)
2. Add bookmark feature (medium) 
3. Optimize image loading (complex)

Let's start with /quick-learn and tackle them in order."
```

### **Context Persistence Strategies**

**When to Keep Context:**
- Sequential related bug fixes
- Feature development with iterations
- Refactoring within same area
- Testing and refinements

**When to /clear:**
- Switching to unrelated area
- Starting complex architectural work
- Beginning new feature development
- After completing major milestone

### **Batch Task Handling**

**Related Bug Fixes:**
```
/clear → /quick-learn → fix bug 1 → fix bug 2 → fix bug 3 → commit all
```

**Feature Iterations:**
```
/clear → /quick-learn + /features-learn → implement v1 → refine v2 → polish v3 → commit
```

### **Workflow Automation Ideas**

**Create Custom Commands (Future Enhancement):**
- `/bugfix-start` - Optimized context for bug fixes
- `/feature-start` - Context + planning template for features  
- `/review-ready` - Pre-commit review checklist
- `/session-start` - Daily development session setup

### **Pattern Recognition**

**Track Your Usage:**
- Which commands do you use most?
- What tasks need full context vs quick context?
- How often do you need technical reference?
- Which workflows save the most time?

### **Continuous Optimization**

**Weekly Review:**
- Which workflows worked best?
- Where did you waste tokens?
- What new patterns emerged?
- How can we optimize further?

---

## Quick Reference Cards

### **Daily Workflow Cheat Sheet**

```
🐛 Bug Fix: /clear → /quick-learn → fix → commit
✨ Feature: /clear → /quick-learn + /features-learn → plan → build → commit  
🏗 Architecture: /clear → /full-learn → plan → implement → commit
⚡ Performance: /clear → /quick-learn + /tech-learn → analyze → optimize → commit
🔒 Security: /clear → /full-learn → assess → fix → test → commit
```

### **Context Loading Decision Matrix**

| Task Type | Complexity | Recommended Context | Token Cost |
|-----------|------------|-------------------|------------|
| Bug Fix | Simple | `/quick-learn` | 185 |
| Bug Fix | Complex | `/quick-learn` + `/tech-learn` | 385 |
| New Feature | Small | `/quick-learn` + `/features-learn` | 485 |
| New Feature | Large | `/full-learn` | 960 |
| Refactoring | Minor | `/quick-learn` | 185 |
| Refactoring | Major | `/full-learn` | 960 |
| Performance | Analysis | `/quick-learn` + `/tech-learn` | 385 |
| Security | Any | `/full-learn` | 960 |

### **Token Efficiency Goals**

**Target Token Usage per Session:**
- **Aggressive Optimization**: < 1,000 tokens (mostly quick-learn)
- **Balanced Approach**: 1,000-2,500 tokens (mixed commands)  
- **Deep Work Sessions**: 2,500-4,000 tokens (some full-learn)
- **Architecture Days**: 4,000+ tokens (comprehensive context needed)

---

## Measuring Success

### **Efficiency Metrics**
- **Token usage per task completed**
- **Time to context loading vs productive work ratio**
- **Tasks completed per session**
- **Quality of outputs (bugs introduced, rework needed)**

### **Quality Indicators**
- **Clean commits with good messages**
- **Comprehensive testing coverage**
- **Updated documentation**
- **Minimal follow-up fixes needed**

### **Workflow Health Signs**
- **Quick orientation to codebase**
- **Confident implementation decisions**
- **Efficient debugging processes**
- **Smooth handoffs between tasks**

---

This guide evolves with your development patterns. Update it as you discover new optimizations and workflow improvements!