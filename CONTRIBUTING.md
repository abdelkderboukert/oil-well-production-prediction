# Contributing Guidelines

Thank you for your interest in contributing! Please follow these guidelines.

## Code Style

- Follow **PEP 8** style guidelines
- Use **Black** for code formatting
- Use **isort** for import organization
- Maximum line length: 127 characters
- Use descriptive variable and function names

### Running Code Quality Checks

```bash
# Format code
black src/ main.py

# Sort imports
isort src/ main.py

# Lint code
flake8 src/ main.py

# Static analysis
pylint src/ main.py

# Security scanning
bandit -r src/
```

## Testing

- Write tests for new features
- Maintain >80% code coverage
- All tests must pass before merging

```bash
# Run tests
pytest tests/ -v --cov=src

# Run specific test
pytest tests/test_pipeline.py::TestDataIngestion::test_load_raw_data -v
```

## Commit Messages

Use conventional commit format:

```
type(scope): short description

longer description if needed

Fixes #issue_number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/description`
2. Make your changes
3. Run code quality checks
4. Run all tests
5. Commit with conventional messages
6. Push to your fork
7. Open a pull request with clear description
8. Address review comments
9. Ensure all CI checks pass

## Security

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Report security issues to security@example.com

## Documentation

- Update README.md for user-facing changes
- Add docstrings to all functions
- Include examples for complex features
- Keep documentation up-to-date

## Development Setup

```bash
# Clone repository
git clone https://github.com/abdelkderboukert/oil-well-production-prediction.git
cd oil-well-production-prediction

# Create virtual environment
python -m venv virt
source virt/bin/activate  # On Windows: virt\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install pytest pytest-cov black flake8 isort pylint

# Run tests
pytest tests/ -v
```

## Questions?

- Check existing documentation
- Look at issue discussions
- Ask in pull request comments
- Email: info@example.com
