# wcslight Release Notes

This repository is part of the AstroViewer dependency family and now follows a
dual-license model.

Before a commercial-facing release is considered final, review:

- `LICENSE.md`
- `LICENSE-COMMERCIAL.md`
- `LICENSE-NONCOMMERCIAL.md`

## Current release policy

- keep the current package name `wcslight` until the package-channel strategy
  is finalized across the full dependency family
- tag releases from `main` with `v<version>`
- use CI build success as the minimum release gate

## Suggested release flow

```bash
git checkout dev
git pull origin dev

git checkout -b release/3.0.0

npm version 3.0.0 --no-git-tag-version
npm install
npm run prod

git status
git add package.json package-lock.json README.md LICENSE.md LICENSE-COMMERCIAL.md LICENSE-NONCOMMERCIAL.md ci-cd.md .github/workflows/ci.yml
git commit -m "Prepare release 3.0.0"

git push -u origin release/3.0.0

```
Open PR release/3.0.0 -> main in github and merge on main.

From main:
```bash
git checkout main
git pull origin main

node -p "require('./package.json').version"
npm ci
npm run prod
npm pack --dry-run

git tag -a v3.0.0 -m "Release v3.0.0"
git push origin v3.0.0
npm publish
```

After release, merge to dev:
```bash
git checkout dev
git pull origin dev
git merge main

npm version 3.1.0-snapshot --no-git-tag-version
npm install

git add package.json package-lock.json
git commit -m "Start 3.1.0-snapshot development"
git push origin dev

```