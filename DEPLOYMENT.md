# Deployment Guide for @johnhoro/visualization-library

This guide will walk you through the process of deploying your visualization library to npm.

## Prerequisites

1. **npm Account**: Make sure you have an npm account at [npmjs.com](https://npmjs.com)
2. **npm CLI**: Install npm CLI globally if not already installed
3. **Git Repository**: Your code should be in a Git repository

## Step 1: Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

## Step 2: Verify Your Package Configuration

Your `package.json` is already configured correctly with:
- ✅ Package name: `@johnhoro/visualization-library`
- ✅ Version: `1.0.0`
- ✅ Main entry point: `dist/index.js`
- ✅ TypeScript definitions: `dist/index.d.ts`
- ✅ Build scripts configured
- ✅ Dependencies properly set

## Step 3: Build Your Package

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Generate type definitions
- Create the `dist/` folder with all compiled files

## Step 4: Test Your Build

Before publishing, test that your build works:

```bash
# Check what files will be included
npm pack --dry-run

# This will show you exactly what files will be published
```

## Step 5: Publish to npm

### First Time Publishing (Scoped Package)

Since you're using a scoped package (`@johnhoro/`), you need to publish it as public:

```bash
npm publish --access public
```

### For Future Updates

```bash
# Update version first
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes

# Then publish
npm publish
```

## Step 6: Verify Publication

1. Check your package on npm: https://www.npmjs.com/package/@johnhoro/visualization-library
2. Test installation in a new project:

```bash
# Create a test directory
mkdir test-install
cd test-install

# Initialize a new project
npm init -y

# Install your package
npm install @johnhoro/visualization-library

# Test the import
node -e "console.log(require('@johnhoro/visualization-library'))"
```

## Package Structure

Your published package will include:

```
@johnhoro/visualization-library/
├── dist/
│   ├── index.js          # Main JavaScript bundle
│   ├── index.d.ts        # TypeScript definitions
│   ├── charts/           # Chart implementations
│   ├── types.d.ts        # Type definitions
│   └── utils/            # Utility functions
├── README.md             # Documentation
├── LICENSE               # MIT License
└── package.json          # Package metadata
```

## Usage After Publication

Users can install and use your library like this:

```bash
npm install @johnhoro/visualization-library
```

```javascript
import { LineChart, BarChart, PieChart } from '@johnhoro/visualization-library';

// Create charts
const lineChart = new LineChart('#container', {
  data: [{ x: 1, y: 10 }, { x: 2, y: 20 }],
  width: 600,
  height: 400
});
```

## Troubleshooting

### Common Issues

1. **Package name already exists**: Change the package name in `package.json`
2. **Build errors**: Check TypeScript compilation with `npx tsc --noEmit`
3. **Missing files**: Ensure `.npmignore` is configured correctly
4. **Authentication errors**: Re-run `npm login`

### Version Management

- Use semantic versioning (semver)
- `patch`: Bug fixes (1.0.0 → 1.0.1)
- `minor`: New features (1.0.0 → 1.1.0)
- `major`: Breaking changes (1.0.0 → 2.0.0)

## Continuous Deployment

For automatic deployment, consider setting up GitHub Actions:

1. Create `.github/workflows/publish.yml`
2. Configure npm token in GitHub secrets
3. Automate publishing on version tags

## Support

If you encounter issues:
1. Check npm documentation: https://docs.npmjs.com/
2. Verify your package.json configuration
3. Test locally before publishing
4. Use `npm pack --dry-run` to preview the package

## Next Steps

After successful publication:
1. Update your GitHub repository with installation instructions
2. Add badges to your README (npm version, downloads, etc.)
3. Consider adding examples and documentation
4. Set up automated testing and CI/CD
