# CLAUDE.md Improvement Suggestions

Based on analysis of the current codebase, here are suggested improvements to the existing CLAUDE.md:

## Suggested Additions

### 1. Enhanced Error Handling Information
The current CLAUDE.md should include common error scenarios:
- CSV parsing failures and encoding issues (Korean characters)
- Database connection issues with PostgreSQL
- Node.js vs browser JavaScript differences in data processing scripts

### 2. Development Workflow Clarifications
- Clarify the difference between Node.js scripts (`.cjs`, `.js` with import) and browser JavaScript
- Add information about the mixed data processing strategy (some manual updates in utils/fackData, some automatic via APIs)
- Include TypeScript configuration details (loose mode with `strict: false`)

### 3. Data Processing Pipeline Details
Add more specific information about:
- The DataProcessor class location and usage
- CSV file encoding expectations (UTF-8 with Korean support)
- The relationship between raw CSV data and processed JSON files
- Manual vs automatic data updates in different components

### 4. Missing Technical Context
- Husky pre-commit hooks configuration
- Lint-staged rules and their impact on development workflow
- Sentry error tracking setup and configuration
- Bootstrap integration patterns used throughout the project

### 5. Architecture Clarifications
- Explain the "mixed data strategy" pattern used throughout the dashboard
- Document the component data mapping comments system used in page.js
- Add information about the custom hooks pattern (useAsterasysData, useBootstrapUtils, useCardTitleActions)

### 6. Testing Information
The current CLAUDE.md mentions Jest but could expand on:
- Test coverage expectations
- How to run specific test files
- Testing patterns for components that use CSV data

### 7. Environment-Specific Notes
- Development vs production differences
- PostgreSQL setup requirements
- Environment variable validation

## Areas Already Well Covered

The existing CLAUDE.md excellently covers:
- Comprehensive command reference
- Data structure details (21 CSV files, product mappings)
- Business context (RF/HIFU market analysis)
- Component architecture with data source mapping
- YouTube analysis system
- Sub-agent integration

## Recommendation

The current CLAUDE.md is very comprehensive. Consider adding the suggested technical details above while maintaining the excellent business context and data structure documentation that already exists.