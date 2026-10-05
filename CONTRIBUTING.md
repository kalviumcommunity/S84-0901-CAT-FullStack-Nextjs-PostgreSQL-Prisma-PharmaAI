# Contributing to PharmaResearch AI

Thank you for your interest in contributing to **PharmaResearch AI**! This guide outlines our contribution standards, Git branching strategy, and pull request workflow.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and professional environment. Please communicate constructively and maintain high standards of code hygiene and respectful collaboration.

---

## 2. Branching Strategy

We follow the GitHub Flow branching model:
- `main`: Production-ready code. Directly protected.
- `feat/<feature-name>`: New feature implementations.
- `fix/<bug-name>`: Bug fixes and issue patches.
- `docs/<doc-topic>`: Documentation enhancements.
- `chore/<task-name>`: Dependency updates, CI/CD, or maintenance.

---

## 3. Commit Convention

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` A new feature or capability.
- `fix:` A bug fix.
- `docs:` Documentation changes only.
- `style:` Code style/formatting changes with no logic alteration.
- `refactor:` Code refactoring without changing external behavior.
- `test:` Adding or updating automated test suites.
- `chore:` Tooling, configuration, or dependency updates.

Example:
```bash
git commit -m "feat(chat): add interactive citation badge highlighting"
```

---

## 4. Pull Request Workflow

1. **Fork or Clone**: Ensure your working branch is branched off the latest `main`.
2. **Implement Changes**: Keep PRs focused on a single responsibility.
3. **Run Checks Locally**:
   ```bash
   cd pharma-research-ai
   npm ci
   npm run lint
   npm run build
   ```
4. **Open Pull Request**: Submit your PR targeting `main` with a clear, descriptive title and summary of changes.
5. **Review & CI**: Ensure all automated CI checks pass before requesting reviews.
