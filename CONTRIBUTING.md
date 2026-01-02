# Contributing to Seafood Marketplace

Thank you for helping improve this project. This document describes the recommended workflow, code style, testing, and PR checklist.

1) Reporting issues

- Open a clear issue with steps to reproduce, expected behavior, and environment details.
- Tag the issue with an appropriate label (bug, enhancement, question).

2) Branching and commits

- Create a branch from `main`:

```powershell
git checkout -b feature/short-description
```

- Use Conventional Commits for messages (see https://www.conventionalcommits.org/):

```
feat(auth): add login endpoint
fix(cart): correct item quantity logic
chore: update dependencies
```

3) Code style & linting

- Follow existing ESLint rules in `frontend/` and backend style in `backend/`.
- Run linters before committing:

```powershell
cd frontend
npm run lint
cd ../backend
npm run lint
```

4) Tests

- Add unit tests for new functionality where applicable.
- Run tests locally before opening a PR. Example (if configured):

```powershell
npm test
```

5) Pull Request checklist

- [ ] Branch is up to date with `main` and builds cleanly
- [ ] Commits are atomic and follow convention
- [ ] Linting passes and tests added/updated
- [ ] Description explains the change and testing steps
- [ ] No secrets or `.env` values included

6) Review process

- Assign reviewers and respond to review comments.
- Make small follow-up commits rather than rebasing publicly after review unless instructed.

7) Large changes and migrations

- For changes that affect data or require migrations, add a migration script in `backend/scripts/` and document rollout steps in the PR description.

8) Security and sensitive data

- Do NOT commit secrets, API keys, or `.env` files. Use the project's secret management or CI secret variables.

If you'd like, I can also add a `PULL_REQUEST_TEMPLATE.md` and issue templates. Tell me which templates you want.
