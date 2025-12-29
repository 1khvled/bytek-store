# GitHub Deployment Guide

## Step 1: Configure Git Identity

First, set your Git identity (replace with your actual name and email):

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Or if you only want to set it for this repository:

```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Create Initial Commit

The files are already staged. Create the commit:

```powershell
git commit -m "Initial commit: BytekStore e-commerce platform with Supabase integration"
```

## Step 3: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `bytek-store` (or your preferred name)
4. Description: "E-commerce platform built with React, TypeScript, and Supabase"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

## Step 4: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add the remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename default branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 5: Verify Deployment

1. Go to your GitHub repository page
2. You should see all your files
3. Verify that `.env` is NOT in the repository (it should be in .gitignore)

## Important Notes

### Environment Variables
- Your `.env` file is already in `.gitignore` and will NOT be pushed to GitHub
- Anyone cloning the repo will need to create their own `.env` file
- Never commit sensitive keys to GitHub

### What Gets Pushed
✅ All source code
✅ Configuration files
✅ Documentation
✅ Supabase migrations
❌ `.env` file (excluded)
❌ `node_modules` (excluded)
❌ `dist` folder (excluded)

## Future Updates

To push future changes:

```powershell
git add .
git commit -m "Description of changes"
git push
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```powershell
gh repo create bytek-store --public --source=. --remote=origin --push
```

This will create the repo and push in one command.

