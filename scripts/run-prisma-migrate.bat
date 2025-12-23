@echo off
REM Helper script to run prisma generate (Windows)
cd services\auth-service
npm install
echo Running prisma generate...
npm run prisma:generate
echo To run migrations interactively, execute:
echo npm run prisma:migrate:dev
@echo off
REM Helper script to run prisma migrate (Windows)
cd services\auth-service
npm install
echo Running prisma generate...
npm run prisma:generate
echo To run migrations interactively, execute:
echo npm run prisma:migrate:dev
