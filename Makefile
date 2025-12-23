.PHONY: prisma-generate prisma-seed ci-kind-start ci-kind-clean

prisma-generate:
	@echo "Running prisma generate"
	npx prisma generate

prisma-seed: prisma-generate
	@echo "Seeding Prisma data"
	node prisma/seed.js

ci-kind-start:
	@echo "Build images and start kind cluster (local helper)"
	docker build -t buildbrain/gateway:ci ./gateway
	docker build -t buildbrain/project-service:ci ./services/project-service
	docker build -t buildbrain/auth-service:ci ./services/auth-service
	docker build -t buildbrain/ai-service:ci ./services/ai-service
	docker build -t buildbrain/payment-service:ci ./services/payment-service
	docker build -t buildbrain/blueprint-agent:ci ./package-services/blueprint-agent

	kind create cluster --name buildbrain-ci || true
	kind load docker-image buildbrain/gateway:ci --name buildbrain-ci
	kind load docker-image buildbrain/project-service:ci --name buildbrain-ci
	kind load docker-image buildbrain/auth-service:ci --name buildbrain-ci
	kind load docker-image buildbrain/ai-service:ci --name buildbrain-ci
	kind load docker-image buildbrain/payment-service:ci --name buildbrain-ci
	kind load docker-image buildbrain/blueprint-agent:ci --name buildbrain-ci

	@echo "Rendering Helm templates and applying to kind"
	helm template infra/helm/buildbrain -f infra/helm/buildbrain/values-ci.yaml > infra/k8s/rendered-ci.yaml
	kubectl apply -f infra/k8s/rendered-ci.yaml

ci-kind-clean:
	@echo "Tearing down kind cluster"
	kind delete cluster --name buildbrain-ci || true
up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f
