# GitHub Packages Configuration

This project uses GitHub Packages (GitHub's npm registry) instead of the public npm registry for publishing and consuming packages.

## Why GitHub Packages?

- **Private by default**: Packages are private to your organization
- **Integrated with GitHub**: Seamless integration with GitHub workflows
- **No additional cost**: Included with GitHub repositories
- **Better security**: Uses GitHub authentication tokens

## Configuration

### For Publishing (CI/CD)

The project is already configured to publish to GitHub Packages:

1. **`.releaserc.json`**: Configured to use `https://npm.pkg.github.com`
2. **`.github/workflows/release.yml`**: Uses GitHub token for authentication
3. **`packages/cli/.npmrc`**: Scoped registry configuration

### For Installing (Users)

#### Option 1: One-time installation with registry flag

```bash
npm install -g @yotpoltd/cadr-cli --registry=https://npm.pkg.github.com
```

#### Option 2: Configure npm globally for @yotpoltd scope

```bash
# Add to your global .npmrc
echo "@yotpoltd:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Then install normally
npm install -g @yotpoltd/cadr-cli
```

#### Option 3: Project-specific configuration

Create a `.npmrc` file in your project:

```text
@yotpoltd:registry=https://npm.pkg.github.com
```

## Authentication

### For Public Packages (Recommended)

If the package is public, no authentication is required for installation.

### For Private Packages

If you need to install private packages, you'll need a GitHub Personal Access Token:

1. Create a token with `read:packages` permission
2. Configure npm authentication:

```bash
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN
```

Or add to your `.npmrc`:

```text
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

## Package Scope

The package is published under the `@yotpoltd` scope:

- Package name: `@yotpoltd/cadr-cli`
- Registry: `https://npm.pkg.github.com`
- Organization: `YotpoLtd`

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. Verify your GitHub token has the correct permissions
2. Check that the token is correctly configured in `.npmrc`
3. Ensure the package scope matches your organization

### Registry Resolution

If npm can't find the package:

1. Verify the registry URL is correct
2. Check that the scope configuration is in place
3. Try clearing npm cache: `npm cache clean --force`

### CI/CD Issues

If the release workflow fails:

1. Verify `GITHUB_TOKEN` has `write:packages` permission
2. Check that the package name matches the organization scope
3. Ensure the `.npmrc` file is committed to the repository
