# MASI Web API Endpoints Reference

## Overview
The MASI Web API is a Django REST Framework backend located at `process.env.NEXT_PUBLIC_API_URL`.
All endpoints require authentication using ClerkAuthentication or SessionAuthentication.

**IMPORTANT**: The user controls the Django backend. When new aggregated data or complex processing is needed, prefer creating new backend endpoints rather than processing large datasets on the frontend.

---

## Base Configuration

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// All requests require Authorization header
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json' // for POST/PUT/PATCH
}
```

---

## Available Endpoints

### Authentication & User

#### Get Current User
```
GET /api/me/
```
Returns authenticated user information (email, role, first_name, last_name, username)

#### API Info
```
GET /api/info/
```
Lists all available endpoints

---

### Lookup/Helper Endpoints

#### List All Schools
```
GET /api/schools/
```
Returns array of all schools with id, name, type, city, address, contact info

**Frontend Usage**: Dropdown menus, filters, autocomplete

#### List All Mentors
```
GET /api/mentors/
```
Returns array of users who have submitted at least one visit
Fields: id, username, first_name, last_name, email

**Frontend Usage**: Mentor filters, directory, performance tracking

---

### Visit Endpoints (All Programs)

All visit endpoints follow the same pattern and support common query parameters.

#### Common Query Parameters
- `time_filter`: `7days` | `30days` | `90days` | `thisyear` | `all` (default)
- `school`: Filter by school ID
- `mentor`: Filter by mentor user ID

Can be combined: `?time_filter=30days&school=10&mentor=5`

#### MASI Literacy Visits
```
GET    /api/mentor-visits/
POST   /api/mentor-visits/
GET    /api/mentor-visits/{id}/
PUT    /api/mentor-visits/{id}/
PATCH  /api/mentor-visits/{id}/
DELETE /api/mentor-visits/{id}/
```

**Fields**:
- `school_id` (POST only, write-only)
- `visit_date` (YYYY-MM-DD)
- `letter_trackers_correct` (boolean)
- `reading_trackers_correct` (boolean)
- `sessions_correct` (boolean)
- `admin_correct` (boolean)
- `quality_rating` (1-10)
- `supplies_needed` (text)
- `commentary` (text)

Response includes full `mentor` and `school` objects.

#### Yebo Visits
```
GET    /api/yebo-visits/
POST   /api/yebo-visits/
GET    /api/yebo-visits/{id}/
PUT    /api/yebo-visits/{id}/
PATCH  /api/yebo-visits/{id}/
DELETE /api/yebo-visits/{id}/
```

**Fields**:
- `school_id` (POST only, write-only)
- `visit_date` (YYYY-MM-DD)
- `paired_reading_took_place` (boolean)
- `paired_reading_tracking_updated` (boolean)
- `afternoon_session_quality` (1-10)
- `commentary` (text)

#### 1000 Stories Visits
```
GET    /api/thousand-stories-visits/
POST   /api/thousand-stories-visits/
GET    /api/thousand-stories-visits/{id}/
PUT    /api/thousand-stories-visits/{id}/
PATCH  /api/thousand-stories-visits/{id}/
DELETE /api/thousand-stories-visits/{id}/
```

**Fields**:
- `school_id` (POST only, write-only)
- `visit_date` (YYYY-MM-DD)
- `library_neat_and_tidy` (boolean)
- `tracking_sheets_up_to_date` (boolean)
- `book_boxes_and_borrowing` (boolean)
- `daily_target_met` (boolean)
- `story_time_quality` (1-10)
- `other_comments` (text)

#### Numeracy Visits
```
GET    /api/numeracy-visits/
POST   /api/numeracy-visits/
GET    /api/numeracy-visits/{id}/
PUT    /api/numeracy-visits/{id}/
PATCH  /api/numeracy-visits/{id}/
DELETE /api/numeracy-visits/{id}/
```

**Fields**:
- `school_id` (POST only, write-only)
- `visit_date` (YYYY-MM-DD)
- `numeracy_tracker_correct` (boolean)
- `teaching_counting` (boolean)
- `teaching_number_concepts` (boolean)
- `teaching_patterns` (boolean)
- `teaching_addition_subtraction` (boolean)
- `quality_rating` (1-10)
- `supplies_needed` (text)
- `commentary` (text)

---

### Dashboard & Analytics

#### Dashboard Summary
```
GET /api/dashboard-summary/
```

**Query Parameters**: Same as visit endpoints (time_filter, school, mentor)

**Response**:
```typescript
{
  total_visits: number;           // All visit types combined
  recent_visits: number;          // Last 30 days
  schools_visited: number;        // Unique schools
  avg_quality: number;           // Average quality rating for literacy
  literacy_visits: number;
  literacy_recent_visits: number; // Last 30 days
  yebo_visits: number;
  yebo_recent_visits: number;
  stories_visits: number;
  stories_recent_visits: number;
  numeracy_visits: number;
  numeracy_recent_visits: number;
}
```

**Frontend Usage**: Dashboard KPIs, executive summary, trend analysis

---

### WIG Endpoints

#### GET /api/wig/outcomes/
Term-keyed outcome (lag) measures for the literacy hero WIG rings (ADMIN/PM only).
Returns `{available, source_note, outcomes: {core_literacy, ecd_literacy}, data_as_of}`;
each outcome has value/numerator/denominator/cohort_total/term/baseline. Fail-closed:
sync-log problems, syncs older than 48h, or dedupe exceptions return available=false.

---

## Frontend Integration Patterns

### Fetching with SWR (Recommended)

```typescript
import useSWR from 'swr';
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();

const fetcher = async (url: string) => {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('API request failed');
  return response.json();
};

// Example: Fetch dashboard summary
const { data, error, isLoading } = useSWR(
  `/api/dashboard-summary?time_filter=${timeFilter}&school=${schoolFilter}`,
  fetcher
);
```

### Creating a Visit

```typescript
const token = await getToken();

const response = await fetch(`${API_URL}/mentor-visits/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    school_id: 10,
    visit_date: '2024-11-20',
    letter_trackers_correct: true,
    reading_trackers_correct: true,
    sessions_correct: true,
    admin_correct: true,
    quality_rating: 8,
    supplies_needed: 'More books',
    commentary: 'Great session'
  })
});

if (!response.ok) throw new Error('Failed to create visit');
const visit = await response.json();
```

---

## Missing Endpoints (Need Backend Implementation)

### Visit Frequency Over Time
Currently implemented on frontend by fetching all visits and aggregating by month.

**Recommended Backend Endpoint**:
```
GET /api/visit-frequency/
```

**Suggested Response**:
```typescript
{
  data: Array<{
    time_period: string;      // "Jan 2025", "Feb 2025"
    literacy_visits: number;
    yebo_visits: number;
    stories_visits: number;
    numeracy_visits: number;
  }>
}
```

**Query Parameters**: time_filter, school, mentor (same as other endpoints)

**Benefits**: 
- Reduced payload (monthly aggregates vs all visits)
- Faster response time
- Consistent with backend processing pattern
- Easier to add advanced aggregations (weekly, quarterly, etc.)

---

## Backend Development Guidelines

When adding new endpoints:

1. **Authentication**: Use ClerkAuthentication or SessionAuthentication
2. **Filtering**: Support time_filter, school, mentor query params
3. **Auto-fill**: Set `mentor` from `request.user` automatically
4. **Validation**: Use DRF serializers for data validation
5. **Error Handling**: Return appropriate HTTP status codes
6. **Documentation**: Update Swagger/OpenAPI schema

### Standard Response Codes
- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

---

## Testing

Interactive API documentation available at:
- Schema: `/api/schema/`
- Swagger UI: `/api/schema/docs/`

---

## Notes

- The `mentor` field is automatically set from authenticated user on POST
- All timestamps (created_at, updated_at) are auto-managed
- Quality ratings must be between 1-10
- Dates use ISO format (YYYY-MM-DD)
- Boolean fields default to `false`
- For large datasets or complex aggregations, prefer backend endpoints over frontend processing

