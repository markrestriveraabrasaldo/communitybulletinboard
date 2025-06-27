# Which Spec? - Decision Helper

Helps you choose the right planning approach based on task complexity and scope.

## Quick Decision Tree

### 🚀 No Spec Needed (< 1 hour)
**Use for:**
- Typo fixes and copy changes
- Single CSS property adjustments  
- Environment variable updates
- Simple dependency updates
- Quick documentation fixes

**Action:** Just do it! Use `/quick-learn` and implement directly.

### ⚡ Micro Plan (1-2 hours)
**Use `/micro-plan` for:**
- Bug fixes affecting 1-3 files
- Small UI improvements
- Adding simple validations
- Configuration tweaks
- Single component modifications

**Signs you need micro planning:**
- "This should be quick but I want to avoid scope creep"
- "Let me list the files I need to touch"
- "I want to define success criteria clearly"

### 📋 Quick Spec (2-8 hours)  
**Use `/quick-spec` for:**
- Small to medium features
- Refactoring across multiple components
- Complex bug fixes requiring investigation
- Integration with new libraries/APIs
- Performance optimization projects

**Signs you need quick planning:**
- "This touches several components"
- "I need to think through the approach"
- "There are multiple ways to solve this"
- "I want to break this into phases"

### 📚 Full Spec (1+ days)
**Use `/full-spec` (existing create-spec) for:**
- Major new features
- Architectural changes
- Database schema modifications
- Security implementations
- Large refactoring projects

**Signs you need comprehensive planning:**
- "This affects the core architecture"
- "Multiple team members need to understand this"
- "This has significant risk if done wrong"
- "I need stakeholder buy-in"

## Task Complexity Assessment

### Size Indicators

**Time Estimate:**
- < 1 hour → No spec
- 1-2 hours → `/micro-plan`
- 2-8 hours → `/quick-spec`  
- 1+ days → `/full-spec`

**Files Affected:**
- 1-2 files → `/micro-plan`
- 3-6 files → `/quick-spec`
- 7+ files → `/full-spec`

**Risk Level:**
- Low risk → `/micro-plan`
- Medium risk → `/quick-spec`
- High risk → `/full-spec`

**Investigation Needed:**
- Clear solution → `/micro-plan`
- Some unknowns → `/quick-spec`
- Major unknowns → `/full-spec`

## Real-World Examples

### Micro Plan Examples ⚡
- Fix search highlighting CSS bug
- Add loading spinner to form submission
- Update category icons
- Fix mobile responsive issue in header
- Add new validation rule to existing form
- Update error message text
- Adjust spacing in post grid

### Quick Spec Examples 📋  
- Add user bookmark feature
- Implement post reporting system
- Refactor search to use new API
- Add image compression before upload
- Create notification system
- Implement post expiration dates
- Add user rating system
- Optimize database queries

### Full Spec Examples 📚
- Complete redesign of authentication system
- Add real-time chat functionality  
- Implement payment processing
- Major database schema migration
- Switch to different hosting platform
- Add multi-language support
- Implement advanced admin dashboard

## Context Loading Recommendations

**After choosing your spec type, load appropriate context:**

### Micro Plan Context
- **Start with:** `/quick-learn`
- **Add if needed:** `/tech-learn` (for technical patterns)

### Quick Spec Context  
- **Feature work:** `/quick-learn` + `/features-learn`
- **Refactoring:** `/quick-learn` + `/tech-learn`
- **Bug investigation:** `/quick-learn` + `/status-learn`

### Full Spec Context
- **Always start with:** `/full-learn`
- **Add as needed:** Specific context commands

## When in Doubt...

### Start Small
If you're unsure between two levels, start with the smaller planning approach. You can always upgrade to more comprehensive planning if needed.

### Common Mistakes
- **Over-planning small tasks** → Slows down development
- **Under-planning complex work** → Leads to scope creep and rework
- **Skipping planning entirely** → Results in unfocused implementation

### The "2x Rule"
If you think a task will take X hours, it will likely take 2X hours. Plan accordingly:
- Think it's 30 minutes? It's probably 1 hour → `/micro-plan`
- Think it's 2 hours? It's probably 4 hours → `/quick-spec`  
- Think it's 4 hours? It's probably 8 hours → `/quick-spec` or `/full-spec`

## Quick Commands Reference

```bash
# For small tasks (1-2 hours)
/micro-plan

# For medium tasks (2-8 hours)  
/quick-spec

# For large tasks (1+ days)
/full-spec  # (existing create-spec)

# For decision help
/which-spec  # (this command)
```

**Remember:** The goal is right-sized planning that helps you succeed, not perfect documentation. Choose the level that gives you confidence and clarity without slowing you down!