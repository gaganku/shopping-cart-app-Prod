# Creating a New Repository and Deploying

## Step 1: Commit Current Changes

```bash
# Add all changes
git add -A

# Commit with a message
git commit -m "v5.0: Production-ready restructuring with automated setup"

# Merge to main
git checkout main
git merge v5-development
```

## Step 2: Create New Repository on GitHub

### Option A: Via GitHub Website
1. Go to https://github.com/new
2. Repository name: `modernshop-ecommerce` (or your preferred name)
3. Description: "Modern full-stack e-commerce platform with Node.js, Express, MongoDB"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Option B: Via GitHub CLI
```bash
# Install GitHub CLI if not installed
# Windows: winget install GitHub.cli
# Mac: brew install gh

# Login
gh auth login

# Create repository
gh repo create modernshop-ecommerce --public --source=. --remote=origin --push
```

## Step 3: Link and Push to New Repository

If you created via website (Option A):

```bash
# Remove old remote if exists
git remote remove origin

# Add new remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/modernshop-ecommerce.git

# Push to new repository
git push -u origin main
git push origin v5-development
git push origin --tags
```

## Step 4: Setup Repository

### Add Repository Description
Add this to your GitHub repository description:
```
Modern e-commerce platform with Node.js, Express, MongoDB. Features: User auth, Google OAuth, Admin dashboard, Product management, Order processing.
```

### Add Topics/Tags
Add these topics to your repository:
- `nodejs`
- `express`
- `mongodb`
- `ecommerce`
- `shopping-cart`
- `google-oauth`
- `passport`
- `full-stack`

### Enable GitHub Pages (Optional)
If you want to host documentation:
1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: main, folder: /docs (if you create docs)

## Step 5: Clone and Setup for Others

Anyone can now clone and setup your project:

**Windows:**
```powershell
git clone https://github.com/USERNAME/modernshop-ecommerce.git
cd modernshop-ecommerce
.\setup.ps1
```

**Mac/Linux:**
```bash
git clone https://github.com/USERNAME/modernshop-ecommerce.git
cd modernshop-ecommerce
chmod +x setup.sh
./setup.sh
```

## Step 6: Additional Repository Setup

### Add Badges to README
Add these at the top of README.md:

```markdown
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-4.4+-green)
![License](https://img.shields.io/badge/license-MIT-blue)
```

### Create .github Folder
Add GitHub-specific files:

```bash
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
```

### Add Issue Templates
Creates standard issue templates for bugs and features

### Add Pull Request Template
Creates standard PR template

## What the Setup Scripts Do

### setup.ps1 (Windows) / setup.sh (Unix/Mac)
1. ✅ Check Node.js installation
2. ✅ Check npm installation
3. ✅ Check MongoDB installation
4. ✅ Install npm dependencies (`npm install`)
5. ✅ Create .env from template if missing
6. ✅ Display next steps

### Users Just Need To:
1. Clone the repo
2. Run setup script
3. Update `.env` with their credentials
4. Start MongoDB
5. Run `npm start`

## Repository Best Practices

### Branch Protection Rules
Consider adding these rules for `main` branch:
- Require pull request reviews
- Require status checks to pass
- Enforce linear history

### Continuous Integration (Future)
Add GitHub Actions for:
- Automated testing
- Code linting
- Security scanning
- Auto-deployment

### Security
- Add SECURITY.md file
- Enable Dependabot for security updates
- Add code scanning

---

**Your project is now ready for open source or team collaboration!**
