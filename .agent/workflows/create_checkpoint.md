---
description: Create a new git checkpoint (tag) and update the CHANGELOG.md
---

This workflow guides you through creating a named checkpoint (git tag) and documenting the changes in the CHANGELOG.md file.

# 1. Prepare the Changelog Entry
First, identify the key changes made since the last checkpoint.
- **Added**: New features or significant improvements.
- **Fixed**: Bug fixes or layout corrections.
- **Changed**: Existing functionality that was modified.

Construct a markdown entry in the following format:
```markdown
## [checkpoint_name] - YYYY-MM-DD

### Added
- Feature 1
- Feature 2

### Fixed
- Bug fix 1
```

# 2. Update CHANGELOG.md
Use `replace_file_content` to prepend this new entry to the top of the `CHANGELOG.md` file (just below the title/header).

# 3. Commit Changes
Run the following commands to stage and commit the changelog update:
```bash
git add CHANGELOG.md
git commit -m "Docs: Update CHANGELOG for checkpoint [checkpoint_name]"
```

# 4. Create and Push Tag
Run the following commands to create the tag and push it:
```bash
git tag [checkpoint_name]
git push origin [checkpoint_name]
```
// turbo
```bash
git push origin HEAD
```

# 5. Verify
Confirm that the tag was pushed successfully.
