# Cursor Project Rules - MASI Web

This folder contains documentation and guidelines for the MASI Web project. These files serve as the knowledge base for AI assistants and developers working on the project.

---

## 📚 Documentation Index

### 1. [API Endpoints Reference](./api-endpoints.md)
Complete documentation of all available backend API endpoints.

**Contents**:
- Authentication & User endpoints
- Visit endpoints for all 4 programs (MASI Literacy, Yebo, 1000 Stories, Numeracy)
- Lookup/Helper endpoints (Schools, Mentors)
- Dashboard summary statistics
- Query parameters and filtering patterns
- Request/Response examples
- Frontend integration examples

**When to use**: Reference this when calling backend APIs, understanding available data, or implementing new features.

---

### 2. [Backend Django Notes](./backend-django-notes.md)
Guidelines for Django backend development and architecture.

**Contents**:
- When to add backend endpoints vs frontend processing
- Current backend structure and models
- Common patterns (filtering, auto-setting mentor)
- Database optimization tips
- Query optimization examples
- Testing approaches

**When to use**: Before implementing new backend features, optimizing queries, or deciding where logic should live.

---

### 3. [Frontend-Backend Integration](./frontend-backend-integration.md)
Patterns and best practices for frontend development and API integration.

**Contents**:
- Data fetching with SWR and Clerk
- File organization (API functions, types, components)
- Loading and error state handling
- Design system patterns and styles
- Chart integration with Plotly
- Environment variables
- When frontend processing is acceptable

**When to use**: Building new frontend features, components, or API integrations.

---

### 4. [Recommended Backend Endpoints](./recommended-backend-endpoints.md)
Prioritized list of backend endpoints that should be implemented.

**Contents**:
- Priority 1: Visit Frequency Over Time (with full implementation guide)
- Priority 2: School Performance Metrics
- Priority 3: Mentor Activity Report
- Priority 4: Program Trends
- Priority 5: Quality Distribution
- Future considerations
- Implementation checklist

**When to use**: Planning backend development, identifying technical debt, or improving performance.

---

## 🎯 Quick Reference

### Current Frontend Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS
- **Data Fetching**: SWR
- **Auth**: Clerk
- **Charts**: react-plotly.js

### Current Backend Stack
- **Framework**: Django REST Framework
- **Auth**: Clerk + Session
- **Database**: PostgreSQL (likely)

### Key Principles

1. **Backend-First Processing**: Prefer backend endpoints for data aggregation and complex calculations
2. **Type Safety**: All API interactions use TypeScript types
3. **Error Handling**: Always handle loading, error, and success states
4. **Consistent Patterns**: Follow established patterns for API calls, components, and styling
5. **Performance**: Optimize for speed - aggregate on backend, lazy load, use proper indexing

---

## 🔄 Workflow for New Features

### Adding a Data Visualization Feature

1. **Check API Endpoints** (`api-endpoints.md`)
   - Does the required endpoint exist?
   - Can existing endpoints provide the data?

2. **If No Suitable Endpoint**:
   - Check `recommended-backend-endpoints.md` - is it already planned?
   - Plan the new endpoint (query params, response format)
   - Implement on Django backend (see `backend-django-notes.md`)
   - Update `api-endpoints.md` with new endpoint

3. **Frontend Implementation** (see `frontend-backend-integration.md`):
   - Create TypeScript types in `/src/lib/types/`
   - Create API function in `/src/lib/api/mentors/`
   - Create component in `/src/components/[section]/`
   - Use SWR for data fetching
   - Handle loading/error states
   - Match existing design system

4. **Testing**:
   - Test with real data
   - Check responsive design
   - Verify error handling
   - Test filters and interactions

---

## 📝 Current Status

### ✅ Implemented Features
- Dashboard summary statistics
- Program breakdown cards
- Visit frequency chart (frontend aggregation)
- Filter bar (time, school, mentor)
- All CRUD operations for 4 visit types

### 🚧 Known Issues
- Visit frequency fetches all visits (should use backend endpoint)
- No pagination (will be needed as data grows)
- No real-time updates (currently requires refresh)

### 🎯 High Priority Next Steps
1. Implement `/api/visit-frequency/` endpoint (see recommended-backend-endpoints.md)
2. Add school performance comparison
3. Add mentor activity dashboard
4. Implement pagination for visit lists

---

## 🤖 For AI Assistants

When working on this project:

1. **Always check these docs first** before making assumptions about available APIs
2. **Prefer backend endpoints** for data processing (see backend-django-notes.md)
3. **Follow established patterns** (see frontend-backend-integration.md)
4. **Update documentation** when adding new endpoints or patterns
5. **Reference existing code** in similar components for consistency

### Common Questions

**Q: Where should I process this data?**
A: See "When to Add Backend Endpoints" in `backend-django-notes.md`

**Q: How do I call the API?**
A: See examples in `api-endpoints.md` and patterns in `frontend-backend-integration.md`

**Q: What endpoints exist?**
A: See complete list in `api-endpoints.md`

**Q: What styles should I use?**
A: See "Design System Patterns" in `frontend-backend-integration.md`

---

## 📞 Contact

For questions about:
- **Backend**: Jim (controls Django backend)
- **Frontend**: See patterns in this documentation
- **API Changes**: Update docs and inform team

---

## 🔄 Keeping This Updated

When you:
- Add a new endpoint → Update `api-endpoints.md`
- Change a pattern → Update relevant doc
- Solve a common problem → Document the solution
- Add a recommendation → Add to `recommended-backend-endpoints.md`

These docs are living documents. Keep them current!

