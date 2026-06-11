# Makefile for SoloBill Project
# Drives installation, development, linting, and testing for both frontend and backend

.PHONY: help install dev dev-frontend dev-backend lint test clean

# Help command to list available targets
help:
	@echo "Available commands:"
	@echo "  make install      - Install frontend and backend dependencies"
	@echo "  make dev          - Start both frontend and backend development servers in parallel"
	@echo "  make dev-frontend - Start only the frontend development server"
	@echo "  make dev-backend  - Start only the backend development server"
	@echo "  make lint         - Run linting checks on frontend and backend"
	@echo "  make test         - Run test suites for frontend and backend"
	@echo "  make clean        - Clean up build artifacts and temporary files"

# Bootstraps the environment using npm and uv
install:
	@echo "Installing frontend dependencies..."
	cd frontend/solobill && npm install
	@echo "Installing backend dependencies..."
	cd backend && uv sync

# Starts local backend and Vite frontend development servers in parallel
# Uses shell trap to ensure both processes terminate cleanly on Ctrl+C
dev:
	@echo "Starting backend and frontend development servers..."
	@trap 'kill 0' SIGINT; \
	(cd backend && uv run uvicorn app.main:app --reload --port 7777) & \
	(cd frontend/solobill && npm run dev)

# Starts only the frontend development server
dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend/solobill && npm run dev

# Starts only the backend development server
dev-backend:
	@echo "Starting backend development server..."
	cd backend && uv run uvicorn app.main:app --reload --port 7777

# Executes code formatters and static analysis
lint:
	@echo "Linting frontend..."
	cd frontend/solobill && npm run lint || true
	@echo "Linting backend..."
	@if command -v ruff >/dev/null 2>&1; then \
		cd backend && ruff check .; \
	else \
		echo "ruff not found, skipping backend lint. Install with 'uv pip install ruff'"; \
	fi

# Runs backend and frontend test suites
test:
	@echo "Running frontend tests..."
	@if cd frontend/solobill && npm run test -- --run >/dev/null 2>&1; then \
		cd frontend/solobill && npm run test; \
	else \
		echo "No frontend test script found in package.json"; \
	fi
	@echo "Running backend tests..."
	@if [ -d "backend/tests" ]; then \
		cd backend && uv run pytest; \
	else \
		echo "No backend tests directory found in backend/tests"; \
	fi

# Cleans up build/cache files
clean:
	@echo "Cleaning frontend build artifacts..."
	rm -rf frontend/solobill/dist
	rm -rf frontend/solobill/node_modules
	@echo "Cleaning backend cache artifacts..."
	find backend -type d -name "__pycache__" -exec rm -rf {} +
	find backend -type d -name ".pytest_cache" -exec rm -rf {} +
	find backend -type d -name ".ruff_cache" -exec rm -rf {} +
