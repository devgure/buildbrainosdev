buildbrainos/
├── 📁 client/                      
│   ├── 📁 mobile/                  # React Native + Expo App
│   │   ├── app.json
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── screens/              # Main app screens
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects/
│   │   │   ├── BlueprintViewer.tsx
│   │   │   ├── SafetyInspection.tsx
│   │   │   └── BidMarketplace.tsx
│   │   ├── lib/
│   │   │   ├── database/         # WatermelonDB setup
│   │   │   ├── location/         # Geofencing logic[citation:2][citation:7]
│   │   │   └── voice/
│   │   └── package.json
│   │   ├── App.tsx
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── services/api.ts        
│   │   └── i18n/                   
│   │
│   ├── 📁 web-mobile/             
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/api.ts
│   │   │   ├── i18n/
│   │   │   └── App.tsx
│   │   └── vite.config.ts
│   │
│   └── 📁 web-desktop/           
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── layout/
│       │   ├── services/api.ts
│       │   ├── i18n/
│       │   └── App.tsx
│       └── next.config.js         
│
├── 📁 gateway/            Kong/Node.js Gateway Service     
│   ├── server.js                  
│   ├── routes/
│   ├── middleware/auth.js
│   ├── graphql/schema.graphql
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── 📁 services/                   
│   ├── 📁 auth-service/      # NestJS - Auth0 integration, RBAC
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── models/user.js
│   │   │   ├── utils/jwt.js
│   │   │   ├── services/firebase.js
│   │   │   └── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── k8s/deployment.yaml
│   │
│   ├── 📁 user-service/         NestJS - User & company management
│   │   ├── src/controllers/user.js
│   │   ├── src/models/user.js
│   │   ├── src/routes/
│   │   └── Dockerfile
│   ├── 📁 company-service/            # NestJS - User & company management
│   │   ├── src/controllers/profile.js
│   │   ├── src/models/Profile.js
│   │   ├── src/routes/
│   │   └── Dockerfile
│   ├── 📁 project-service//             # NestJS - Core project entity 
│   │   ├── src/controllers/project.js
│   │   ├── src/models/Project.js
│   │   ├── src/routes/
│   │   └── Dockerfile
│   ├── 📁 document-service/            # NestJS - PDF/File processing
│   │   ├── src/controllers/dcument.js
│   │   ├── src/models/document.js
│   │   ├── src/routes/
│   │   └── Dockerfile
│   ├── 📁 compliance-service/            # NestJS - Insurance & license checks
│   │   ├── src/controllers/Insurance & license checksjs
│   │   ├── src/models/Insurance & license checks
│   │   ├── src/routes/
│   │   └── Dockerfile
│   ├── 📁 agent-orchestrator/ # Temporal.io + LangGraph workflows[citation:4]  ORCHESTRATOR (Temporal.io) Long-running workflows (RFI tracking, sub onboarding,Event-driven triggers (email, drawing upload)
│   │   ├── src/controllers/
│   │   ├── src/models/
│   │   ├── src/routes/
│   │   └── Dockerfile
│   ├── 📁  marketplace-service/      # NestJS - Bid matching & posting
│   │   ├── src/controllers/ Bid matching & posting
│   │   ├── src/models/ Bid matching & posting
│   │   ├── src/routes/
│   │   └── Dockerfile
│   │
│   ├── 📁 match-service/
│   │   ├── src/algorithms/basic.js
│   │   ├── src/routes/match.js
│   │   └── Dockerfile
│   │
│   ├── 📁 chat-service/
│   │   ├── src/server.js           # Socket.IO
│   │   ├── src/models/Message.js
│   │   └── Dockerfile
│   │
│   ├── 📁 media-service/
│   │   ├── src/upload.js           # AWS S3 / Cloudinary      
│   │   └── Dockerfile
│   │
│   ├── 📁  ai-agents-core/           # Shared AI agent interfaces
│   │   ├── src/controllersai-agent
│   │   ├── src/utils/r
│   │   └── Dockerfil
│   ├── 📁 discovery-service/
│   │   ├── src/controllers/discovery.js
│   │   ├── src/utils/redis-geo.js
│   │   └── Dockerfile
│   ├── 📁  shared-types/             # Shared TypeScript definitions
│   │   ├── src/controllers/
│   │   ├── src/utils/
│   │   └── Dockerfile
│   │
│   ├── 📁 notification-service/         # NestJS - WebSocket, email, SMS
│   │   ├── src/fcm.js              # Firebase Cloud Messaging
│   │   └── Dockerfile
│   │
│   ├── 📁 analytics-service/
│   │   ├── src/routes/analytics.js
│   │   └── Dockerfile
│   │
│   └── 📁 ai-service/              # AI/ML Engine (Python)
│       ├── app/
│       │   ├── matching_engine.py
│       │   ├── facial_analysis.py
│       │   ├── nlp_processor.py
│       │   └── predictor.py
│       ├── requirements.txt
│       ├── Dockerfile
│       │
│       ├── 📁 payment-service/    #  Billing	Stripe + Usage Metering  payment processor  Stripe (Payments / Billing) |
│       ├── src/controllers/
│       ├── src/utils/
│       └── Dockerfile
│     ── 📁 payment-service/   
|
|
├── 📁 package-services/
│   ├── blueprint-agent/          # FastAPI - Llama 3 + Qwen-2.5-VL
│   ├── safety-agent/             # FastAPI - OpenCV, YOLO
│   ├── compliance-ocr-agent/     # FastAPI - Tesseract/AWS Textract[citation:3]
│   ├── bid-scraper-agent/        # Python - Scrapes Dodge, ConstructConnect
│   └── scheduler-agent/          # Python - CPM scheduling logic   
│
├── 📁 data/                       # Data layer configs
│   ├── redis.conf
│   ├── elasticsearch-setup/
│   │   └── mappings.json
│   └── mongodb/                   # Migrations & seeds
│       └── seed-users.js
|   ├── mongodb/                  # Prisma schema & migrations
│   ├── neo4j/                    # Cypher queries & constraints
│   └── qdrant/                   # Vector DB setup for RAG
│
├── 📁 infra/                      # Infrastructure as Code
│   ├── k8s/
│   │   ├── namespace.yaml
│   │   ├── ingress.yaml
│   │   ├── postgres-deployment.yaml
│   │   ├── mongodb-statefulset.yaml
│   │   ├── redis-deployment.yaml
│   │   └── kustomization.yaml
│   │
│   ├── docker/
│   │   └── docker-compose.yml     # Local dev    # Local dev with all services[citation:6]
│   │
│   └── terraform/                 # AWS/GCP provisioning
│       ├── main.tf
│       ├── variables.tf
│       └── eks-cluster.tf
│
├── 📁 monitoring/
│   ├── prometheus.yml
│   ├── grafana/dashboards/
│   ├── elasticsearch/
│   │   └── logstash.conf
│   └── sentry.config.js
│
├── 📁 admin-dashboard/            #  # Next.js Web Portal  React-based Admin Panel   
│   ├── src/
│   │   ├── pages/Users.js
│   │   ├── pages/Reports.js
│   │   ├── pages/Analytics.js
│   │   └── services/adminApi.js
│   └── Dockerfile
│
├── 📁 tests/
│   ├── unit/
│   │   ├── auth.test.js
│   │   └── profile.test.js
│   ├── integration/
│   │   └── match.integration.test.js
│   └── e2e/
│       ├── mobile.test.js         # Detox
│       └── web.test.js            # Cypress
│
├── 📁 scripts/
│   ├── deploy.sh
│   ├── migrate-db.js
│   └── seed-ai-models.py
│
├── 📄 .gitignore
├── 📄 README.md
├── 📄 Makefile                    # Common commands
└── 📄 docker-compose.yml          # For local dev (gateway + service