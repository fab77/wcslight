# wcslight CI/CD

This repository is part of the AstroViewer dependency family and follows a dual-license model.

Before a commercial-facing release is considered final, review:

- `LICENSE.md`
- `LICENSE-COMMERCIAL.md`
- `LICENSE-NONCOMMERCIAL.md`

## Current release policy

- publish the package as `wcslight`
- publish public releases to npmjs.com
- keep `dev` as the integration branch
- create feature branches from `dev`
- prepare final package versions on `release/<version>` branches
- merge release branches to `main` only after CI passes
- tag releases from `main` with `v<version>`
- publish only from a release tag
- use GitHub Actions Trusted Publishing via OIDC
- do not use long-lived `NPM_TOKEN` or `NODE_AUTH_TOKEN` credentials for publishing
- use `npm test` and `npm pack --dry-run` as deterministic release gates
- keep remote network-dependent tests separate from the mandatory CI/release gate
- keep `package.json` and `package-lock.json` versions aligned
- after each release, merge `main` back into `dev` before starting the next snapshot version

## Test strategy

wcslight uses three test levels.

### Unit tests

Unit tests run without external services:

```bash
npm run test:unit
```

### Local integration tests

Local integration tests exercise real cross-component behavior using deterministic fixtures stored in the repository.

The HiPS integration test uses:

```text
test/fixtures/hips/decaps/
├── properties
└── Norder4/
    └── Dir0/
        └── Npix2326.fits
```

A local HTTP fixture server is used so that the test follows the same HTTP-based HiPS loading path as production code without requiring Internet access.

Run local integration tests with:

```bash
npm run test:integration
```

### Remote integration tests

Remote tests use live external services and require Internet access.

For example, the HiPS remote test uses the CDS/Aladin HiPS service.

Run them explicitly with:

```bash
npm run test:remote
```

Remote tests are useful as end-to-end validation but are not mandatory CI or automated release gates because failures may be caused by network or external-service availability.

### Standard CI test command

The standard deterministic test gate is:

```bash
npm test
```

It performs:

```text
production build
    +
unit tests
    +
local integration tests
```

To execute all tests, including remote tests:

```bash
npm run test:all
```

## CI

GitHub Actions runs CI on pushes and pull requests.

The CI workflow:

- checks out the repository
- sets up Node.js 22
- installs dependencies with `npm ci`
- runs the deterministic build and test suite with `npm test`
- verifies the npm package contents with `npm pack --dry-run`

The CI workflow is defined in:

```text
.github/workflows/ci.yml
```

A successful CI run is required before merging release branches to `main`.

## Development flow

Development happens on `dev`.

Start a feature branch from an up-to-date `dev` branch:

```bash
git checkout dev
git pull --ff-only origin dev

git checkout -b feature/<name>
```

During development, use snapshot versions, for example:

```json
"version": "3.1.0-snapshot"
```

After development and CI validation, merge the feature branch back into `dev`.

## Release flow

The following example describes release `3.1.0`.

Start from an up-to-date `dev` branch:

```bash
git checkout dev
git pull --ff-only origin dev
```

Optionally run all tests, including the remote end-to-end tests, before creating the release branch:

```bash
npm ci
npm run test:all
```

Create the release branch:

```bash
git checkout -b release/3.1.0
```

Set the final package version without creating a Git tag:

```bash
npm version 3.1.0 --no-git-tag-version
```

Run the deterministic release gates:

```bash
npm ci
npm test
npm pack --dry-run
```

Review the changes:

```bash
git status
git diff
```

Commit the release preparation:

```bash
git add package.json package-lock.json
git commit -m "Prepare release 3.1.0"
git push -u origin release/3.1.0
```

Include any release-specific source, documentation, license, CI, or workflow changes in the release branch when required.

Open a pull request:

```text
release/3.1.0 -> main
```

Merge only after CI passes and the release content has been reviewed.

## Tag and publish

After the release pull request is merged:

```bash
git checkout main
git pull --ff-only origin main
```

Verify the version:

```bash
node -p "require('./package.json').version"
```

Optionally repeat the deterministic release gates locally:

```bash
npm ci
npm test
npm pack --dry-run
```

Create the release tag:

```bash
git tag -a v3.1.0 -m "Release v3.1.0"
git push origin v3.1.0
```

Pushing the tag triggers:

```text
.github/workflows/release.yml
```

The release workflow:

- checks out the tagged repository state
- configures Node.js 24
- configures npmjs.com as the package registry
- verifies that the Git tag matches the version in `package.json`
- installs dependencies with `npm ci`
- runs `npm test`
- runs `npm pack --dry-run`
- publishes `wcslight` to npmjs.com

Publishing uses npm Trusted Publishing with GitHub Actions OIDC.

No long-lived npm publishing token is required.

Remote network-dependent tests are intentionally not part of the automated publish workflow.

## Verify published package

Check the currently published version:

```bash
npm view wcslight version
```

Inspect package metadata:

```bash
npm info wcslight
```

Verify a specific release:

```bash
npm view wcslight@3.1.0
```

## Clean package installation test

A release should also be tested as an installed npm package rather than only from the repository checkout.

Create a temporary directory:

```bash
mkdir /tmp/wcslight-test
cd /tmp/wcslight-test
npm init -y
```

Install the published package:

```bash
npm install wcslight@3.1.0
```

Verify the installed package version:

```bash
node -e "console.log(require('wcslight/package.json').version)"
```

Verify the ESM entry point:

```bash
node --input-type=module -e "import('wcslight').then(() => console.log('wcslight ESM import OK'))"
```

Verify the CommonJS entry point:

```bash
node -e "require('wcslight'); console.log('wcslight CommonJS require OK')"
```

This installation test is especially important because wcslight publishes separate ESM and CommonJS bundles and depends on `astrospatial-core`.

## Start the next development cycle

After the release is published, synchronize `dev` with the released state on `main`.

Update `main`:

```bash
git checkout main
git pull --ff-only origin main
```

Update `dev`:

```bash
git checkout dev
git pull --ff-only origin dev
```

Merge the released state back into `dev`:

```bash
git merge main
git push origin dev
```

Start the next snapshot version:

```bash
npm version 3.1.1-snapshot --no-git-tag-version
```

Review the changes:

```bash
git diff
```

Commit and push:

```bash
git add package.json package-lock.json
git commit -m "Start 3.1.1 development"
git push origin dev
```

The resulting branch state should be:

```text
main
└── 3.1.0

dev
└── 3.1.1-snapshot
```

## Release pipeline summary

```text
feature/*
    │
    ▼
   dev
3.1.0-snapshot
    │
    │ optional:
    │ npm run test:all
    ▼
release/3.1.0
    │
    │ version -> 3.1.0
    │ npm test
    │ npm pack --dry-run
    ▼
   PR
    │
    │ CI passes
    ▼
  main
  3.1.0
    │
    ▼
tag v3.1.0
    │
    ▼
release.yml
    │
    │ npm test
    │ npm pack --dry-run
    │ OIDC / Trusted Publishing
    ▼
 npmjs.com
wcslight@3.1.0
    │
    ▼
merge main -> dev
    │
    ▼
   dev
3.1.1-snapshot
```