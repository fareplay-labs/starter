.PHONY: help up down logs clean migrate install setup

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
up: ## Start local databases (PostgreSQL + Redis)
	docker-compose up -d
	@echo "✅ Development databases started!"
	@echo "📊 PostgreSQL: localhost:5432"
	@echo "🔴 Redis: localhost:6379"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Create apps/api/.env file (see README)"
	@echo "  2. Run: make db-push"
	@echo "  3. Run: npm run dev:api   (Terminal 1)"
	@echo "  4. Run: npm run dev:web   (Terminal 2)"

down: ## Stop local databases
	docker-compose down

logs: ## Show database logs
	docker-compose logs -f

# Database Commands
db-push: ## Push Prisma schema to database
	cd apps/api && npx prisma db push

db-studio: ## Open Prisma Studio
	cd apps/api && npx prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "⚠️  This will delete all data! Press Ctrl+C to cancel..."
	@sleep 5
	cd apps/api && npx prisma migrate reset --force

# Cleanup Commands
clean: ## Stop containers and remove volumes
	docker-compose down -v
	@echo "✅ Containers and volumes removed"

# Status Commands
ps: ## Show running containers
	docker-compose ps

# Install & Setup
install: ## Install dependencies
	npm install
	cd packages/types && npm run build

setup: install up db-push ## Complete first-time setup
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Start developing:"
	@echo "  Terminal 1: npm run dev:api"
	@echo "  Terminal 2: npm run dev:web"
	@echo ""
	@echo "Frontend: http://localhost:3000"
	@echo "API: http://localhost:8080"

