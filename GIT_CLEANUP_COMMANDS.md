# Git Repository Cleanup Commands

## Problem
- node_modules was accidentally committed to Git
- Repository size is over 50MB
- Need to remove tracked files without deleting them locally

## Step 1: Check Current Status
```bash
# Check Git status
git status

# Check large files
git ls-files | xargs du -sh

# Check file sizes
git count-objects -vH
```

## Step 2: Remove Files from Git Tracking
```bash
# Remove node_modules from Git tracking (keep local files)
git rm -r --cached node_modules

# Remove build directories from tracking
git rm -r --cached build/
git rm -r --cached dist/

# Remove .env files from tracking
git rm -r --cached .env
git rm -r --cached .env.local

# Remove Python cache files
git rm -r --cached __pycache__/
git rm -r --cached *.pyc
git rm -r --cached *.pyo
git rm -r --cached *.pyd

# Remove any other large unnecessary files
git rm -r --cached *.db
git rm -r --cached *.sqlite
git rm -r --cached *.sqlite3
```

## Step 3: Verify Cleanup
```bash
# Check what was removed
git status

# Verify no large files remain
git ls-files | xargs du -sh

# Check new repository size
git count-objects -vH
```

## Step 4: Add .gitignore and Commit
```bash
# Add .gitignore
git add .gitignore

# Commit the cleanup
git commit -m "Remove large files and add proper .gitignore"

# Push changes
git push origin main
```

## Step 5: Alternative - Reset History (if needed)
```bash
# WARNING: This will rewrite Git history
# Use only if cleanup is complex

# Create new clean branch
git checkout --orphan -b clean-main

# Add all files except ignored ones
git add .

# Commit clean state
git commit -m "Clean repository with proper .gitignore"

# Replace main branch
git branch -M main
git push -f origin clean-main

# Go back to main
git checkout main
```

## Step 6: Verify Repository
```bash
# Check final status
git status

# Check repository size
git count-objects -vH

# Verify .gitignore is working
echo "test.txt" > test.txt
git add test.txt
git commit -m "Test .gitignore"
git rm test.txt
git status
```

## Expected Results
After cleanup:
- Repository size should be < 10MB
- node_modules should be ignored
- .env files should be ignored
- Build artifacts should be ignored
- Git history should be clean

## Common Commands
```bash
# Quick cleanup one-liner
git rm -r --cached node_modules && git add .gitignore && git commit -m "Remove node_modules and add .gitignore" && git push

# Check what's being tracked
git ls-files | head -20

# Remove all cached files
git rm -r --cached . && git add . && git commit -m "Clean all cached files" && git push
```

## Important Notes
- These commands remove files from Git tracking but KEEP them locally
- The .gitignore prevents them from being added again
- Always verify before pushing to GitHub
- Test locally after cleanup to ensure project still works
