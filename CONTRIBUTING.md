# Contributing to SkillForge

Thank you for considering contributing to SkillForge! 🎉

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/SKILLFORGE-FULL-STACK-APPLICATION.git`
3. **Set up** the development environment (see [README.md](README.md#-quick-start))
4. **Create a branch**: `git checkout -b feature/your-feature-name`

## 🧑‍💻 Development Workflow

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python run.py    # Starts on http://localhost:5000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev      # Starts on http://localhost:5173
```

### Running Tests
```bash
python -m pytest backend/tests -v
npm run build --prefix frontend    # Type-check + production build
```

## 📝 Pull Request Guidelines

1. **One feature per PR** — Keep changes focused and reviewable
2. **Write descriptive commit messages** — Use conventional commits when possible
3. **Test your changes** — Ensure existing tests pass and add new tests for new features
4. **Update documentation** — If you add a new endpoint or feature, update the README
5. **Follow existing code style** — Match the patterns used in the codebase

## 🐛 Bug Reports

Please open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS/Python/Node versions

## 💡 Feature Requests

Open an issue tagged `[Feature Request]` with:
- Clear description of the feature
- Use case / motivation
- Optional: proposed implementation approach

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.
