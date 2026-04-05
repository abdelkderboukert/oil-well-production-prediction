I'm creating a README with project overview and instructions...

---

# Oil Well Production Prediction

An enterprise-grade machine learning pipeline for predicting oil well production rates using Random Forest regression. The project includes comprehensive data ingestion, preprocessing, model training, and visualization capabilities.

## Features

- **Data Processing**: Complete ETL pipeline with data cleaning and validation
- **Machine Learning**: Random Forest-based production prediction model
- **Visualization**: Comprehensive analysis plots and feature importance charts
- **Security**: Automated security scanning, secret detection, and vulnerability checks
- **Testing**: Unit tests with pytest and coverage reporting
- **CI/CD**: GitHub Actions workflows for automated testing and deployment
- **Container Support**: Docker support for reproducible environments

## Quick Start

### Prerequisites

- Python 3.11+
- Git
- Virtual environment support (venv/conda)

### Installation

```bash
# Clone repository
git clone https://github.com/abdelkderboukert/oil-well-production-prediction.git
cd oil-well-production-prediction

# Create virtual environment
python -m venv virt
source virt/bin/activate  # On Windows: virt\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Pipeline

```bash
python main.py
```

This will:

1. Load configuration from `config/config.yaml`
2. Ingest raw data from `data/raw/data.csv`
3. Preprocess and clean the data
4. Train the Random Forest model
5. Generate evaluation metrics
6. Create visualizations in `plots/`
7. Save the trained model to `models/production_model.joblib`

## Project Structure

```
.
├── config/
│   └── config.yaml              # Configuration parameters
├── data/
│   ├── raw/                     # Raw input data
│   └── processed/               # Cleaned data
├── models/                      # Trained models
├── plots/                       # Generated visualizations
├── reports/                     # Evaluation metrics
├── src/
│   ├── ingestion.py            # Data loading module
│   ├── preprocessing.py        # Data cleaning module
│   ├── model.py                # Model creation module
│   ├── train.py                # Training and evaluation
│   ├── visualize.py            # Visualization module
│   └── utils.py                # Utility functions
├── tests/                       # Unit tests
├── main.py                      # Pipeline entry point
├── dockerfile                   # Container configuration
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Configuration

Edit `config/config.yaml` to customize:

```yaml
data:
  raw_path: "data/raw/data.csv"
  processed_path: "data/processed/clean_data.csv"

pipeline:
  target_col: "W_GAS"
  feature_cols: ["HOURS", "WHP", "WHT", "WLP"]

model:
  test_size: 0.2
  random_state: 42
  n_estimators: 50
```

## Model Evaluation

The pipeline generates comprehensive metrics:

- **R² Score**: Proportion of variance explained
- **MAE**: Mean Absolute Error
- **MSE**: Mean Squared Error
- **RMSE**: Root Mean Squared Error

Results are saved to `reports/model_metrics.json`

## Visualizations

The pipeline generates three key visualizations:

1. **Actual vs Predicted**: Scatter plot with perfect prediction line
2. **Feature Importance**: Bar chart of feature contributions
3. **Well Time Series**: Production trends over time

## Development

### Code Quality

```bash
# Format code
black src/ main.py

# Sort imports
isort src/ main.py

# Lint code
flake8 src/ main.py

# Security scanning
bandit -r src/
```

### Testing

```bash
# Run all tests
pytest tests/ -v --cov=src

# Run specific test
pytest tests/test_pipeline.py -v
```

### Docker

#### Build Locally

```bash
# Build image
docker build -t oil-well-prediction:latest .

# Run container
docker run --rm oil-well-prediction:latest
```

#### Using Pre-built Images from GitHub Container Registry

Images are automatically built and scanned on every push to `development` and `main` branches.

```bash
# Authenticate with GitHub Container Registry
echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin

# Pull the latest image from main branch
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Pull image by branch
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:development

# Pull image by commit SHA
docker pull ghcr.io/abdelkderboukert/oil-well-production-prediction:sha-<commit_hash>

# Run the container
docker run --rm \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/plots:/app/plots \
  -v $(pwd)/reports:/app/reports \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main

# Run with custom config
docker run --rm \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/config/config.yaml:/app/config/config.yaml \
  ghcr.io/abdelkderboukert/oil-well-production-prediction:main
```

#### Multi-platform Support

Images are built for multiple architectures:

- `linux/amd64` - Intel/AMD 64-bit
- `linux/arm64` - ARM 64-bit (Apple Silicon, Raspberry Pi)

#### Using Docker Compose

```bash
# Run with docker-compose (if configured)
docker-compose up
```

## Security

This project includes automated security scanning:

- **CodeQL**: Semantic code analysis
- **Semgrep**: Pattern-based vulnerability detection
- **Trivy**: Container image scanning
- **Bandit**: Python security issue detection
- **Secret Scanning**: Automated credential detection
- **Dependency Scanning**: Python package vulnerability checks

See [SECURITY.md](SECURITY.md) for security policies and reporting instructions.

## CI/CD Workflows

### Security Workflow (`security.yaml`)

Runs on push and pull requests. On successful security scans, automatically builds and pushes Docker image to GitHub Container Registry (ghcr.io):

- Secret and credential scanning (TruffleHog, GitGuardian)
- Static code analysis (CodeQL, Semgrep)
- Dependency vulnerability scanning (Safety, pip-audit)
- Code quality checks (Black, isort, Pylint, Flake8)
- Docker image security scanning (Trivy, Grype)
- Pattern-based security analysis
- **Docker image push to ghcr.io** (on push to `development` and `main` branches, skipped on PRs)

**Image Tagging Strategy:**

- `development` branch → `ghcr.io/abdelkderboukert/oil-well-production-prediction:development`
- `main` branch → `ghcr.io/abdelkderboukert/oil-well-production-prediction:main`
- Semantic version tags → `v1.0.0`, `1.0`, etc.
- Commit SHA → `sha-<7-digit-hash>`

### Build Workflow (`CI.yaml`)

Runs on push and pull requests:

- Code linting and formatting
- Unit tests (Python 3.11, 3.12, 3.13)
- Code coverage reporting
- Application build validation

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Performance

- **Data**: Optimized for datasets up to 1M rows
- **Training**: ~5-60 seconds for typical dataset
- **Inference**: Sub-millisecond per sample

## Troubleshooting

### Missing data warnings

Normal during preprocessing. The pipeline uses forward-fill and back-fill imputation.

### Model evaluation differences

Random forest produces non-deterministic results when `n_jobs > 1`. Use `random_state` for reproducibility.

### Docker build issues

Ensure all dependencies in `requirements.txt` are compatible with Python 3.13.

## Requirements

See [requirements.txt](requirements.txt) for complete list. Key dependencies:

- `pandas`: Data manipulation
- `scikit-learn`: Machine learning
- `matplotlib`: Visualization
- `numpy`: Numerical computing
- `pyyaml`: Configuration parsing
- `joblib`: Model serialization

## Performance Optimization

The model uses:

- Random Forest with 50 trees (configurable)
- Multi-threaded training (`n_jobs=-1`)
- Optimized feature selection

Adjust `n_estimators` in config for speed/accuracy tradeoff.

## License

[Specify your license here]

## Authors

- [Your Name/Organization]

## Support

- 📧 Email: info@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/abdelkderboukert/oil-well-production-prediction/issues)
- 📚 Documentation: [See docs/](docs/)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Last Updated**: April 5, 2026
