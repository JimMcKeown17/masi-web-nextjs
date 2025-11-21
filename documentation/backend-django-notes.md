# Django Backend Documentation - MASI Web Application

This comprehensive guide provides information for frontend developers, backend developers, and AI assistants to understand and integrate with the MASI backend system.

---

## Table of Contents
1. [Overview & Philosophy](#overview--philosophy)
2. [Backend Architecture](#backend-architecture)
3. [Authentication System](#authentication-system)
4. [Database Models & Data Structure](#database-models--data-structure)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [When to Add New Endpoints](#when-to-add-new-endpoints)
7. [Recommended Future Endpoints](#recommended-future-endpoints)
8. [Frontend Integration Examples](#frontend-integration-examples)
9. [Environment Configuration](#environment-configuration)
10. [CORS & Security](#cors--security)
11. [Database Optimization](#database-optimization)
12. [Common Use Cases](#common-use-cases)
13. [API Testing & Documentation](#api-testing--documentation)
14. [Troubleshooting](#troubleshooting)

---

## Overview & Philosophy

### Key Principle
The backend is a Django REST Framework API that the user controls and maintains.

**Backend-First Approach**: Prefer backend processing over frontend processing for:
- Data aggregation and summaries
- Complex calculations
- Large dataset transformations
- Business logic that should be centralized
- Operations that can leverage database indexes

### Example: Visit Frequency
❌ **Bad**: Fetch all visits (1000+ records) and aggregate on frontend  
✅ **Good**: Create `/api/visit-frequency/` endpoint that returns monthly aggregates

---

## Backend Architecture

### Tech Stack
- **Framework:** Django 5.1+ (Python web framework)
- **API:** Django REST Framework (DRF)
- **Database:** PostgreSQL (production) / SQLite3 (development)
- **Authentication:** Clerk (JWT-based authentication)
- **API Documentation:** drf-spectacular (OpenAPI/Swagger)
- **CORS:** django-cors-headers
- **Static Files:** WhiteNoise + Google Cloud Storage (production)

### Project Structure
```
masi_website/          # Main Django project
├── settings.py        # Configuration
├── urls.py           # URL routing
└── wsgi.py           # WSGI application

api/                  # REST API application
├── models.py         # Database models
├── serializers.py    # API serializers
├── views/           # API views
├── urls.py          # API URL routing
└── authentication.py # Clerk authentication

core/                # Core functionality
dashboards/          # Dashboard logic
pages/              # Public pages
templates/          # Django templates
static/             # Static assets (CSS, JS, images)
```

### Base URLs
- **Development:** `http://localhost:8000`
- **Production:** `https://masi-website-main.onrender.com`
- **API Prefix:** All API endpoints are prefixed with `/api/`

### Key Features
- RESTful API design
- Token-based authentication (Clerk JWT)
- Comprehensive filtering and querying
- Automatic timestamp management
- Data validation and error handling
- OpenAPI/Swagger documentation

---

## Authentication System

### Overview
The backend uses **Clerk** for authentication, which provides:
- JWT-based token authentication
- User management
- SSO capabilities
- Secure session handling

### Clerk Configuration
- **Clerk Instance:** `fancy-walleye-25.clerk.accounts.dev`
- **Authentication Class:** `api.authentication.ClerkAuthentication`
- **Token Type:** Bearer JWT tokens

### Authentication Flow

```
Frontend (Clerk)                Backend (Django)
     │                                │
     │  1. User logs in via Clerk    │
     ├───────────────────────────────>│
     │                                │
     │  2. Clerk returns JWT token    │
     │<───────────────────────────────┤
     │                                │
     │  3. Frontend includes token    │
     │     in Authorization header    │
     ├───────────────────────────────>│
     │                                │
     │  4. Backend validates token    │
     │     via Clerk JWKS             │
     │                                │
     │  5. Backend creates/updates    │
     │     Django user                │
     │                                │
     │  6. API returns data           │
     │<───────────────────────────────┤
```

### Making Authenticated Requests

**Required Headers:**
```javascript
{
  'Authorization': 'Bearer YOUR_CLERK_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

**Example with Fetch API:**
```javascript
const response = await fetch('http://localhost:8000/api/me/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${clerkToken}`,
    'Content-Type': 'application/json'
  }
});
const userData = await response.json();
```

### User Creation/Update
The backend automatically:
- Validates Clerk JWT tokens
- Fetches user info from Clerk API
- Creates Django user if doesn't exist
- Updates existing user info (email, name)
- Uses case-insensitive email lookup

---

## Database Models & Data Structure

### Core Models

#### 1. **School**
Represents educational institutions where programs operate.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "school_id": Integer (CSV import ID),
  "airtable_id": String (Airtable record ID),
  "name": String (max 200 chars),
  "type": String (ECDC, Primary, Secondary, Other),
  "site_type": String (from Airtable),
  "latitude": Decimal (10, 8),
  "longitude": Decimal (10, 8),
  "address": String (max 255 chars),
  "contact_phone": String (max 40 chars),
  "contact_email": Email,
  "contact_person": String (max 200 chars),
  "principal": String (max 200 chars),
  "city": String (max 100 chars),
  "actively_working_in": String (max 5 chars),
  "is_active": Boolean (default: True),
  "date_added": DateTime (auto),
  "last_updated": DateTime (auto)
}
```

**Relationships:**
- Has many: Youth, Children, Sessions, MentorVisits, YeboVisits, ThousandStoriesVisits, NumeracyVisits

---

#### 2. **Youth**
Represents literacy coaches/youth employees working at schools.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "airtable_id": String (Airtable record ID),
  "employee_id": Integer (unique),
  "first_names": String (max 255 chars),
  "last_name": String (max 255 chars),
  "full_name": String (auto-generated),
  
  # Demographics
  "dob": Date,
  "age": Integer (auto-calculated),
  "gender": String (Male/Female/Other),
  "race": String (Black African/Coloured/White/Indian/Asian/Other),
  
  # ID Information
  "id_type": String (RSA ID/Foreign ID/Passport),
  "rsa_id_number": String (max 50 chars),
  "foreign_id_number": String (max 50 chars),
  
  # Contact
  "cell_phone_number": String (max 50 chars),
  "email": Email,
  "emergency_number": String (max 40 chars),
  
  # Address
  "street_number": String (max 50 chars),
  "street_address": String (max 255 chars),
  "suburb_township": String (max 255 chars),
  "city_or_town": String (max 255 chars),
  "postal_code": String (max 50 chars),
  
  # Employment
  "job_title": String (max 100 chars),
  "employment_status": String (Active/Inactive),
  "start_date": Date,
  "end_date": Date,
  "reason_for_leaving": String (max 255 chars),
  "income_tax_number": String (max 50 chars),
  
  # Banking
  "bank_name": String (max 100 chars),
  "account_type": String (Savings/Current/Cheque),
  "branch_code": String (max 50 chars),
  "account_number": String (max 50 chars),
  
  # Relationships
  "school_id": ForeignKey (School),
  "mentor_id": ForeignKey (Mentor),
  
  # Timestamps
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

---

#### 3. **Child**
Represents children receiving literacy/numeracy instruction.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "airtable_id": String (Airtable record ID),
  "full_name": String (max 255 chars),
  "mcode": String (max 50 chars, unique identifier),
  "grade": String (max 50 chars),
  "on_programme": Boolean (default: True),
  "school_id": ForeignKey (School),
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

**Relationships:**
- Belongs to: School
- Has many: Sessions, WELA_assessments

---

#### 4. **Mentor**
Represents mentors who oversee youth and conduct school visits.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "user_id": OneToOne (Django User),
  "name": String (max 255 chars),
  "is_active": Boolean (default: True),
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

**Relationships:**
- Has many: Youth, Sessions, MentorVisits

---

#### 5. **MentorVisit** (MASI Literacy Program)
Records mentor observations during school visits for the literacy program.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "mentor_id": ForeignKey (User),
  "school_id": ForeignKey (School),
  "visit_date": Date (default: today),
  
  # Observations (Boolean)
  "letter_trackers_correct": Boolean,
  "reading_trackers_correct": Boolean,
  "sessions_correct": Boolean,
  "admin_correct": Boolean,
  
  # Quality Rating
  "quality_rating": Integer (1-10),
  
  # Comments
  "supplies_needed": Text,
  "commentary": Text,
  
  # Timestamps
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

**Common Pattern:** On POST, `mentor` is automatically set from `request.user`

```python
def perform_create(self, serializer):
    serializer.save(mentor=self.request.user)
```

---

#### 6. **YeboVisit** (Yebo Program)
Records Yebo program (paired reading) observations.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "mentor_id": ForeignKey (User),
  "school_id": ForeignKey (School),
  "visit_date": Date,
  
  # Observations
  "paired_reading_took_place": Boolean,
  "paired_reading_tracking_updated": Boolean,
  
  # Quality
  "afternoon_session_quality": Integer (1-10),
  
  # Comments
  "commentary": Text,
  
  # Timestamps
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

---

#### 7. **ThousandStoriesVisit** (1000 Stories Program)
Records 1000 Stories library program observations.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "mentor_id": ForeignKey (User),
  "school_id": ForeignKey (School),
  "visit_date": Date,
  
  # Observations
  "library_neat_and_tidy": Boolean,
  "tracking_sheets_up_to_date": Boolean,
  "book_boxes_and_borrowing": Boolean,
  "daily_target_met": Boolean,
  
  # Quality
  "story_time_quality": Integer (1-10),
  
  # Comments
  "other_comments": Text,
  
  # Timestamps
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

---

#### 8. **NumeracyVisit** (Numeracy Program)
Records numeracy program observations.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "mentor_id": ForeignKey (User),
  "school_id": ForeignKey (School),
  "visit_date": Date,
  
  # Curriculum Observations
  "numeracy_tracker_correct": Boolean,
  "teaching_counting": Boolean,
  "teaching_number_concepts": Boolean,
  "teaching_patterns": Boolean,
  "teaching_addition_subtraction": Boolean,
  
  # Quality
  "quality_rating": Integer (1-10),
  
  # Comments
  "supplies_needed": Text,
  "commentary": Text,
  
  # Timestamps
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

---

#### 9. **Session**
Records teaching sessions between youth and children.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "airtable_id": String (Airtable record ID),
  "session_id": Integer (unique),
  "youth_id": ForeignKey (Youth),
  "child_id": ForeignKey (Child),
  "school_id": ForeignKey (School),
  "mentor_id": ForeignKey (Mentor),
  
  # Session Details
  "total_weekly_sessions": Integer,
  "submitted_for_week": Integer,
  "week": String (max 50 chars),
  "month": String (max 50 chars),
  "month_year": String (max 50 chars),
  "sessions_met_minimum": String (max 10 chars),
  "capture_date": Date,
  
  # Timestamps
  "created_in_airtable": DateTime,
  "created_in_system": DateTime (auto),
  "updated_in_system": DateTime (auto)
}
```

---

#### 10. **WELA_assessments**
Stores literacy assessment scores for children (3 assessments per year).

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "mcode": String (max 20 chars, indexed),
  "assessment_year": Integer (2022, 2023, 2024),
  
  # School Info
  "school": String (max 200 chars),
  "city": String (max 100 chars),
  "centre": String (max 100 chars),
  "type": String (max 50 chars),
  "grade": String (max 20 chars),
  "language": String (max 50 chars),
  
  # Student Info
  "full_name": String (max 200 chars),
  "gender": String (M/F),
  "mentor": String (max 100 chars),
  
  # Program Participation
  "total_sessions": Integer,
  "on_programme": String (max 10 chars),
  "current_lc": String (max 100 chars),
  
  # January Assessment (11 subtests + total)
  "jan_letter_sounds": Integer (0-100),
  "jan_story_comprehension": Integer (0-100),
  "jan_listen_first_sound": Integer (0-100),
  "jan_listen_words": Integer (0-100),
  "jan_writing_letters": Integer (0-100),
  "jan_read_words": Integer (0-100),
  "jan_read_sentences": Integer (0-100),
  "jan_read_story": Integer (0-100),
  "jan_write_cvcs": Integer (0-100),
  "jan_write_sentences": Integer (0-100),
  "jan_write_story": Integer (0-100),
  "jan_total": Integer,
  
  # June Assessment (same 11 subtests + total)
  "june_*": Integer (same structure as jan_*),
  
  # November Assessment (same 11 subtests + total)
  "nov_*": Integer (same structure as jan_*),
  
  # Metadata
  "captured_by": String (max 100 chars),
  "created_at": DateTime (auto),
  "updated_at": DateTime (auto)
}
```

**Computed Properties:**
- `jan_improvement_from_baseline`: June total - January total
- `year_end_improvement`: November total - January total
- `improvement_percentage`: Percentage improvement from Jan to Nov

**Indexes:**
- `(mcode, assessment_year)` - Unique together
- `(school, assessment_year)`
- `(grade, assessment_year)`
- `(mentor, assessment_year)`

---

#### 11. **LiteracySession**
Detailed literacy session records.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "session_id": Integer (unique),
  "lc_full_name": String (max 255 chars),
  "child_full_name": String (max 255 chars),
  "school": String (max 255 chars),
  "grade": String (max 50 chars),
  "sessions_capture_date": Date,
  "total_weekly_sessions_received": Integer,
  "reading_level": String (max 100 chars),
  "letters_done": JSONField (array),
  "mentor": String (max 255 chars),
  "site_type": String (max 100 chars),
  "on_the_programme": String (max 50 chars),
  "month": String (max 50 chars),
  "week": String (max 50 chars),
  "month_and_year": String (max 50 chars),
  "created": DateTime,
  "sessions_met_minimum": String (max 10 chars),
  "duplicate_flag": String (max 255 chars),
  "employee_id": String (max 50 chars),
  "mcode": String (max 50 chars)
}
```

---

#### 12. **NumeracySessionChild**
Detailed numeracy session records (child-level).

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "session_id": String (max 255 chars),
  "nc_full_name": String (max 255 chars),
  "numeracy_site": String (max 255 chars),
  "child_name": String (max 255 chars),
  "sessions_capture_date": Date,
  "children_in_group": Integer,
  "created": String (max 50 chars),
  "current_count_level": String (max 50 chars),
  "baseline_count_level": JSONField (array),
  "number_recognition": String (max 50 chars),
  "month": String (max 50 chars),
  "week": String (max 50 chars),
  "month_and_year": String (max 50 chars),
  "all_sites": JSONField (array),
  "site_placement": String (max 255 chars),
  "employee_id": String (max 255 chars),
  "mentor": String (max 255 chars),
  "employment_status": String (max 255 chars),
  "duplicate_flag": String (max 255 chars)
}
```

---

#### 13. **AirtableSyncLog**
Tracks Airtable synchronization history.

**Fields:**
```python
{
  "id": Integer (Primary Key),
  "sync_type": String (max 50 chars),  # 'youth', 'sessions', etc.
  "started_at": DateTime (auto),
  "completed_at": DateTime,
  "records_processed": Integer,
  "records_created": Integer,
  "records_updated": Integer,
  "records_skipped": Integer,
  "error_message": Text,
  "success": Boolean
}
```

---

## API Endpoints Reference

### Base Information

**Base URL:** `/api/`  
**Authentication:** All endpoints require authentication  
**Content-Type:** `application/json`

### Available Endpoints

#### User & Info Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/info/` | Get API information | Yes |
| GET | `/api/me/` | Get current user info | Yes |

#### Visit Endpoints - MASI Literacy

| Method | Endpoint | Purpose | Filters Available |
|--------|----------|---------|-------------------|
| GET | `/api/mentor-visits/` | List all mentor visits | time_filter, school, mentor |
| POST | `/api/mentor-visits/` | Create new mentor visit | - |
| GET | `/api/mentor-visits/{id}/` | Get specific visit | - |
| PUT/PATCH | `/api/mentor-visits/{id}/` | Update visit | - |
| DELETE | `/api/mentor-visits/{id}/` | Delete visit | - |

#### Visit Endpoints - Yebo Program

| Method | Endpoint | Purpose | Filters Available |
|--------|----------|---------|-------------------|
| GET | `/api/yebo-visits/` | List Yebo visits | time_filter, school, mentor |
| POST | `/api/yebo-visits/` | Create Yebo visit | - |
| GET | `/api/yebo-visits/{id}/` | Get specific visit | - |
| PUT/PATCH | `/api/yebo-visits/{id}/` | Update visit | - |
| DELETE | `/api/yebo-visits/{id}/` | Delete visit | - |

#### Visit Endpoints - 1000 Stories Program

| Method | Endpoint | Purpose | Filters Available |
|--------|----------|---------|-------------------|
| GET | `/api/thousand-stories-visits/` | List 1000 Stories visits | time_filter, school, mentor |
| POST | `/api/thousand-stories-visits/` | Create visit | - |
| GET | `/api/thousand-stories-visits/{id}/` | Get specific visit | - |
| PUT/PATCH | `/api/thousand-stories-visits/{id}/` | Update visit | - |
| DELETE | `/api/thousand-stories-visits/{id}/` | Delete visit | - |

#### Visit Endpoints - Numeracy Program

| Method | Endpoint | Purpose | Filters Available |
|--------|----------|---------|-------------------|
| GET | `/api/numeracy-visits/` | List numeracy visits | time_filter, school, mentor |
| POST | `/api/numeracy-visits/` | Create visit | - |
| GET | `/api/numeracy-visits/{id}/` | Get specific visit | - |
| PUT/PATCH | `/api/numeracy-visits/{id}/` | Update visit | - |
| DELETE | `/api/numeracy-visits/{id}/` | Delete visit | - |

#### Lookup/Helper Endpoints

| Method | Endpoint | Purpose | Description |
|--------|----------|---------|-------------|
| GET | `/api/schools/` | List all schools | Returns all active schools |
| GET | `/api/mentors/` | List all mentors | Returns users who have submitted visits |

#### Dashboard Endpoints

| Method | Endpoint | Purpose | Filters Available |
|--------|----------|---------|-------------------|
| GET | `/api/dashboard-summary/` | Get summary statistics | time_filter, school, mentor |

### Query Parameters

#### Time Filters
Use `?time_filter=` with these values:
- `7days` - Last 7 days
- `30days` - Last 30 days
- `90days` - Last 90 days
- `thisyear` - Current year
- `all` - All records (default)

#### Entity Filters
- `?school=10` - Filter by school ID
- `?mentor=5` - Filter by mentor/user ID

#### Combining Filters
```
/api/mentor-visits/?time_filter=30days&school=10&mentor=5
```

### Common Filtering Pattern

All visit endpoints support filtering via a likely mixin:

```python
class VisitFilterMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        time_filter = self.request.query_params.get('time_filter', 'all')
        school = self.request.query_params.get('school')
        mentor = self.request.query_params.get('mentor')
        
        # Apply filters...
        return queryset
```

---

## When to Add New Endpoints

### Decision Framework

#### Do Add Backend Endpoints For:

1. **Aggregated Data**: Monthly/weekly summaries, totals, averages
   - Example: Visit frequency over time (grouped by month)
   - Reason: Reduces payload, leverages DB aggregation

2. **Complex Queries**: Multi-table joins, subqueries, annotations
   - Example: School performance with multiple metrics
   - Reason: Database is optimized for complex queries

3. **Large Datasets**: When returning >100 records for client-side processing
   - Example: All visits for analysis
   - Reason: Network transfer and client processing overhead

4. **Business Logic**: Calculations that should be centralized
   - Example: Quality score calculations across programs
   - Reason: Consistency and single source of truth

5. **Performance**: Operations that can leverage database indexes
   - Example: Time-series analysis with proper indexes
   - Reason: 10-100x performance improvement

#### Don't Add Backend Endpoints For:

1. **UI State Management**: Sorting, filtering already-fetched data
2. **Small Datasets**: <100 items that are already fetched
3. **Client-Side Only**: Display preferences, animations
4. **Trivial Transformations**: Simple data reshaping

---

## Recommended Future Endpoints

### Priority 1: Visit Frequency Over Time

**Current State**: Frontend fetches ALL visits from 4 endpoints and aggregates client-side.

**Problem**: 
- Fetches potentially thousands of records
- Slow network transfer
- Heavy client-side processing

**Recommended Endpoint**:
```
GET /api/visit-frequency/
```

**Query Parameters**:
- `time_filter`: 7days | 30days | 90days | thisyear | all
- `school`: Filter by school ID
- `mentor`: Filter by mentor ID
- `granularity` (optional): month | week | day (default: month)

**Response Format**:
```json
{
  "data": [
    {
      "time_period": "2025-01",
      "time_period_label": "Jan 2025",
      "literacy_visits": 45,
      "yebo_visits": 23,
      "stories_visits": 18,
      "numeracy_visits": 15
    }
  ]
}
```

**Django Implementation**:
```python
from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def visit_frequency(request):
    time_filter = request.GET.get('time_filter', 'all')
    school = request.GET.get('school')
    mentor = request.GET.get('mentor')
    
    # Build base filters
    filters = {}
    if school:
        filters['school_id'] = school
    if mentor:
        filters['mentor_id'] = mentor
    
    # Apply time filter (helper function)
    date_filter = get_date_filter(time_filter)
    if date_filter:
        filters['visit_date__gte'] = date_filter
    
    # Aggregate by month for each program
    literacy_counts = MentorVisit.objects.filter(**filters)\
        .annotate(month=TruncMonth('visit_date'))\
        .values('month')\
        .annotate(count=Count('id'))\
        .order_by('month')
    
    yebo_counts = YeboVisit.objects.filter(**filters)\
        .annotate(month=TruncMonth('visit_date'))\
        .values('month')\
        .annotate(count=Count('id'))\
        .order_by('month')
    
    stories_counts = ThousandStoriesVisit.objects.filter(**filters)\
        .annotate(month=TruncMonth('visit_date'))\
        .values('month')\
        .annotate(count=Count('id'))\
        .order_by('month')
    
    numeracy_counts = NumeracyVisit.objects.filter(**filters)\
        .annotate(month=TruncMonth('visit_date'))\
        .values('month')\
        .annotate(count=Count('id'))\
        .order_by('month')
    
    # Combine data by month
    all_months = set()
    literacy_dict = {item['month']: item['count'] for item in literacy_counts}
    yebo_dict = {item['month']: item['count'] for item in yebo_counts}
    stories_dict = {item['month']: item['count'] for item in stories_counts}
    numeracy_dict = {item['month']: item['count'] for item in numeracy_counts}
    
    all_months.update(literacy_dict.keys())
    all_months.update(yebo_dict.keys())
    all_months.update(stories_dict.keys())
    all_months.update(numeracy_dict.keys())
    
    # Build response
    data = []
    for month in sorted(all_months):
        if month:  # Skip None values
            data.append({
                'time_period': month.strftime('%Y-%m'),
                'time_period_label': month.strftime('%b %Y'),
                'literacy_visits': literacy_dict.get(month, 0),
                'yebo_visits': yebo_dict.get(month, 0),
                'stories_visits': stories_dict.get(month, 0),
                'numeracy_visits': numeracy_dict.get(month, 0),
            })
    
    return Response({'data': data})
```

**Benefits**:
- 10-100x less data transferred
- Faster response time
- Scales to millions of visits

---

### Priority 2: School Performance Metrics

```
GET /api/school-performance/
```

Returns metrics per school (total visits, avg quality, active programs)

---

### Priority 3: Mentor Activity Report

```
GET /api/mentor-activity/
```

Returns per-mentor statistics (visits count, schools covered, quality avg)

---

### Priority 4: Program Trends

```
GET /api/program-trends/
```

Returns week-over-week or month-over-month growth rates

---

## Frontend Integration Examples

### 1. Setting Up Authentication with Clerk

```javascript
// lib/api.js
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useAPI = () => {
  const { getToken } = useAuth();
  
  const api = axios.create({
    baseURL: API_BASE_URL,
  });
  
  // Add auth token to all requests
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  return api;
};
```

---

### 2. Fetching Dashboard Summary

```javascript
// components/Dashboard.jsx
import { useAPI } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const api = useAPI();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/dashboard-summary/?time_filter=30days');
        setSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Visits</h3>
          <p>{summary.total_visits}</p>
        </div>
        {/* More stat cards... */}
      </div>
    </div>
  );
}
```

---

### 3. Creating a New Visit

```javascript
// components/VisitForm.jsx
import { useState } from 'react';
import { useAPI } from '@/lib/api';

export default function MentorVisitForm({ onSuccess }) {
  const api = useAPI();
  const [formData, setFormData] = useState({
    school_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    letter_trackers_correct: false,
    reading_trackers_correct: false,
    sessions_correct: false,
    admin_correct: false,
    quality_rating: 5,
    supplies_needed: '',
    commentary: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const { data } = await api.post('/mentor-visits/', formData);
      onSuccess?.(data);
      
      // Reset form
      setFormData({
        school_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        letter_trackers_correct: false,
        reading_trackers_correct: false,
        sessions_correct: false,
        admin_correct: false,
        quality_rating: 5,
        supplies_needed: '',
        commentary: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="visit-form">
      {/* Form fields */}
    </form>
  );
}
```

---

### 4. Fetching with Filters Hook

```javascript
// hooks/useVisits.js
import { useState, useEffect } from 'react';
import { useAPI } from '@/lib/api';

export const useVisits = (visitType, filters = {}) => {
  const api = useAPI();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchVisits() {
      try {
        setLoading(true);
        
        // Build query string
        const params = new URLSearchParams();
        if (filters.timeFilter) params.append('time_filter', filters.timeFilter);
        if (filters.school) params.append('school', filters.school);
        if (filters.mentor) params.append('mentor', filters.mentor);
        
        const endpoint = `/${visitType}/${params.toString() ? '?' + params.toString() : ''}`;
        const { data } = await api.get(endpoint);
        
        setVisits(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchVisits();
  }, [visitType, JSON.stringify(filters)]);
  
  return { visits, loading, error };
};
```

---

### 5. Error Handling Pattern

```javascript
// utils/errorHandler.js
export const handleAPIError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return { message: 'Invalid data submitted', details: data };
      case 401:
        return { message: 'Please log in to continue', redirect: '/login' };
      case 403:
        return { message: 'You do not have permission to perform this action' };
      case 404:
        return { message: 'The requested resource was not found' };
      case 500:
        return { message: 'Server error. Please try again later.' };
      default:
        return { message: data?.detail || 'An unexpected error occurred' };
    }
  } else if (error.request) {
    return { message: 'Unable to connect to server. Please check your internet connection.' };
  } else {
    return { message: error.message || 'An error occurred' };
  }
};
```

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the Django project root:

```bash
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/masi_db

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Google Cloud Storage (Production only)
GOOGLE_CREDENTIALS={"type":"service_account",...}
GS_BUCKET_NAME=masi-website
```

### Frontend Environment Variables

Create a `.env.local` file in your Next.js project:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Production URLs

```bash
# Production API
NEXT_PUBLIC_API_URL=https://masi-website-main.onrender.com/api

# Production Clerk Instance
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## CORS & Security

### CORS Configuration

The backend is configured to accept requests from these origins:

**Development:**
- `http://localhost:3000` (Next.js default)
- `http://localhost:3001` (Alternative port)

**Production:**
- `https://masinyusane.org`
- `https://www.masinyusane.org`
- `https://masi-website-main.onrender.com`

### Allowed Methods
- GET, POST, PUT, PATCH, DELETE, OPTIONS (preflight)

### Allowed Headers
- `accept`, `accept-encoding`, `authorization`, `content-type`, `origin`, `user-agent`, `x-csrftoken`, `x-requested-with`

### Security Headers

**Required for All Requests:**
```javascript
{
  'Authorization': 'Bearer YOUR_CLERK_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## Database Optimization

### Indexes to Consider

```python
class MentorVisit(models.Model):
    visit_date = models.DateField(db_index=True)  # For time filtering
    school = models.ForeignKey(School, db_index=True)
    mentor = models.ForeignKey(User, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['visit_date', 'school']),  # Composite
            models.Index(fields=['visit_date', 'mentor']),
        ]
```

### Query Optimization

```python
# Use select_related for foreign keys
visits = MentorVisit.objects.select_related('mentor', 'school').all()

# Use prefetch_related for reverse relations
schools = School.objects.prefetch_related('mentorvisit_set').all()

# Use only() to limit fields
visits = MentorVisit.objects.only('visit_date', 'quality_rating')

# Use aggregate() for calculations
from django.db.models import Avg, Count
stats = MentorVisit.objects.aggregate(
    avg_quality=Avg('quality_rating'),
    total_visits=Count('id')
)
```

---

## Common Use Cases

### Use Case 1: Building a Dashboard

```javascript
import { useState, useEffect } from 'react';
import { useAPI } from '@/lib/api';

export default function DashboardPage() {
  const api = useAPI();
  const [timeFilter, setTimeFilter] = useState('30days');
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    async function fetchSummary() {
      const { data } = await api.get(`/dashboard-summary/?time_filter=${timeFilter}`);
      setSummary(data);
    }
    fetchSummary();
  }, [timeFilter]);
  
  if (!summary) return <div>Loading...</div>;
  
  return (
    <div className="dashboard">
      <h1>MASI Dashboard</h1>
      <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="90days">Last 90 Days</option>
        <option value="thisyear">This Year</option>
      </select>
      {/* Display metrics */}
    </div>
  );
}
```

---

### Use Case 2: School Visit History

```javascript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAPI } from '@/lib/api';

export default function SchoolVisitsPage() {
  const router = useRouter();
  const { id } = router.query;
  const api = useAPI();
  const [visits, setVisits] = useState({ literacy: [], yebo: [], stories: [], numeracy: [] });
  
  useEffect(() => {
    if (!id) return;
    
    async function fetchVisits() {
      const [literacy, yebo, stories, numeracy] = await Promise.all([
        api.get(`/mentor-visits/?school=${id}`).then(r => r.data),
        api.get(`/yebo-visits/?school=${id}`).then(r => r.data),
        api.get(`/thousand-stories-visits/?school=${id}`).then(r => r.data),
        api.get(`/numeracy-visits/?school=${id}`).then(r => r.data)
      ]);
      
      setVisits({ literacy, yebo, stories, numeracy });
    }
    
    fetchVisits();
  }, [id]);
  
  const allVisits = [
    ...visits.literacy.map(v => ({...v, program: 'Literacy'})),
    ...visits.yebo.map(v => ({...v, program: 'Yebo'})),
    ...visits.stories.map(v => ({...v, program: '1000 Stories'})),
    ...visits.numeracy.map(v => ({...v, program: 'Numeracy'}))
  ].sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
  
  return <div>{/* Render visit history */}</div>;
}
```

---

## API Testing & Documentation

### Interactive API Documentation

**Swagger UI:**  
Visit `http://localhost:8000/api/schema/docs/` for interactive API documentation where you can:
- Browse all endpoints
- See request/response schemas
- Test endpoints directly in the browser
- View authentication requirements

### Testing with cURL

**List Schools:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/schools/
```

**Create a Visit:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "school_id": 10,
    "visit_date": "2024-11-20",
    "letter_trackers_correct": true,
    "reading_trackers_correct": true,
    "sessions_correct": true,
    "admin_correct": true,
    "quality_rating": 8,
    "supplies_needed": "Books",
    "commentary": "Great session"
  }' \
  http://localhost:8000/api/mentor-visits/
```

### Using Django Test Framework

```python
from rest_framework.test import APITestCase

class MentorVisitTests(APITestCase):
    def test_create_visit(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/mentor-visits/', data={...})
        self.assertEqual(response.status_code, 201)
```

---

## Troubleshooting

### Common Issues

#### 1. Authentication Errors (401 Unauthorized)

**Problem:** API returns 401 Unauthorized

**Solutions:**
- Verify Clerk token is being sent in Authorization header
- Check token hasn't expired
- Ensure `CLERK_SECRET_KEY` is configured on backend
- Verify Clerk instance URL matches

---

#### 2. CORS Errors

**Problem:** Browser blocks requests due to CORS

**Solutions:**
- Ensure frontend URL is in `CORS_ALLOWED_ORIGINS` in `settings.py`
- Check that credentials are being sent (`credentials: 'include'`)
- Verify `Authorization` header is in `CORS_ALLOW_HEADERS`

---

#### 3. 404 Not Found

**Problem:** Endpoint returns 404

**Solutions:**
- Verify endpoint URL is correct (check `/api/info/` for list)
- Ensure Django server is running
- Check URL includes `/api/` prefix

---

#### 4. 400 Bad Request

**Problem:** Server rejects data

**Solutions:**
- Validate required fields are included
- Check field names match API expectations (e.g., `school_id` not `school`)
- Verify data types (integers, booleans, dates)
- Review error response for specific validation errors

---

## Communication Protocol

When frontend needs new aggregated data:
1. Frontend developer identifies need (e.g., "need monthly visit counts")
2. Document the requirement and desired response format
3. User implements Django endpoint
4. Frontend consumes new endpoint

This pattern was established with the visit frequency feature.

---

## API Versioning Considerations

If breaking changes needed in future:
```
/api/v1/mentor-visits/
/api/v2/mentor-visits/
```

Or use header versioning:
```
Accept: application/json; version=2.0
```

---

## Summary

This guide provides comprehensive information for integrating with the MASI backend API. Key points:

1. **Authentication:** Use Clerk JWT tokens in Authorization header
2. **Base URL:** `/api/` prefix for all endpoints
3. **Four Programs:** Literacy, Yebo, 1000 Stories, Numeracy
4. **CRUD Operations:** Full create, read, update, delete support
5. **Filtering:** Time, school, and mentor filters available
6. **Backend-First:** Prefer backend processing for aggregation and complex queries
7. **Data Models:** Comprehensive models for schools, visits, youth, children, assessments
8. **CORS:** Configured for localhost (dev) and production domains
9. **Error Handling:** Standard HTTP status codes with detailed messages

---

**Last Updated:** November 20, 2024  
**API Version:** 1.0  
**Django Version:** 5.1+  
**DRF Version:** Latest
