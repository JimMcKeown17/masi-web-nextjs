# Recommended Backend Endpoints to Add

This document tracks backend endpoints that should be added to improve performance and follow best practices.

---

## Priority 1: Visit Frequency Over Time

**Current State**: Frontend fetches ALL visits from 4 endpoints and aggregates by month client-side.

**Problem**: 
- Fetches potentially thousands of records
- Slow network transfer
- Heavy client-side processing
- Scales poorly as data grows

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
    },
    {
      "time_period": "2025-02",
      "time_period_label": "Feb 2025",
      "literacy_visits": 52,
      "yebo_visits": 28,
      "stories_visits": 20,
      "numeracy_visits": 19
    }
  ]
}
```

**Django Implementation Hint**:
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
    
    # Apply time filter
    date_filter = get_date_filter(time_filter)  # Helper function
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

**URLs Configuration**:
```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... existing paths
    path('visit-frequency/', views.visit_frequency, name='visit-frequency'),
]
```

**Frontend Update** (once endpoint exists):
```typescript
// lib/api/mentors/visit-frequency.ts
export async function getVisitFrequency(
  token: string,
  filters?: DashboardFilters
): Promise<VisitFrequencyResponse> {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  if (filters?.school) params.append('school', filters.school);
  if (filters?.mentor) params.append('mentor', filters.mentor);

  const url = `${API_URL}/visit-frequency/${params.toString() ? `?${params}` : ''}`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch visit frequency data');
  }

  return response.json();
}
```

**Benefits**:
- 10-100x less data transferred (aggregates vs raw visits)
- Faster response time
- Scales to millions of visits
- Consistent with backend-processing pattern

---

## Priority 2: School Performance Metrics

**Use Case**: Compare school performance across programs

**Recommended Endpoint**:
```
GET /api/school-performance/
```

**Query Parameters**:
- `time_filter`: 7days | 30days | 90days | thisyear | all
- `program`: literacy | yebo | stories | numeracy | all (default)

**Response Format**:
```json
{
  "schools": [
    {
      "id": 1,
      "name": "Sunshine Primary",
      "total_visits": 45,
      "literacy_visits": 20,
      "yebo_visits": 10,
      "stories_visits": 8,
      "numeracy_visits": 7,
      "avg_quality_rating": 8.2,
      "unique_mentors": 3,
      "last_visit_date": "2025-11-15"
    }
  ]
}
```

**Use Cases**:
- School comparison dashboard
- Identify underserved schools
- Track program adoption
- Resource allocation decisions

---

## Priority 3: Mentor Activity Report

**Use Case**: Track individual mentor performance and engagement

**Recommended Endpoint**:
```
GET /api/mentor-activity/
```

**Query Parameters**:
- `time_filter`: 7days | 30days | 90days | thisyear | all
- `mentor_id` (optional): Specific mentor

**Response Format**:
```json
{
  "mentors": [
    {
      "id": 1,
      "name": "John Doe",
      "total_visits": 67,
      "schools_visited": 8,
      "avg_quality_rating": 8.5,
      "programs": {
        "literacy": 30,
        "yebo": 15,
        "stories": 12,
        "numeracy": 10
      },
      "visit_frequency": {
        "avg_visits_per_week": 3.2,
        "most_active_day": "Wednesday"
      }
    }
  ]
}
```

**Use Cases**:
- Mentor leaderboard
- Performance reviews
- Workload balancing
- Training needs identification

---

## Priority 4: Program Trends

**Use Case**: Track month-over-month or week-over-week growth

**Recommended Endpoint**:
```
GET /api/program-trends/
```

**Query Parameters**:
- `period`: week | month | quarter
- `program`: literacy | yebo | stories | numeracy | all

**Response Format**:
```json
{
  "current_period": {
    "visits": 234,
    "schools": 15,
    "mentors": 12
  },
  "previous_period": {
    "visits": 198,
    "schools": 14,
    "mentors": 11
  },
  "change": {
    "visits_percent": 18.2,
    "schools_percent": 7.1,
    "mentors_percent": 9.1
  }
}
```

---

## Priority 5: Quality Distribution

**Use Case**: Understand quality rating patterns across programs/schools

**Recommended Endpoint**:
```
GET /api/quality-distribution/
```

**Query Parameters**:
- `time_filter`: 7days | 30days | 90days | thisyear | all
- `group_by`: school | mentor | program

**Response Format**:
```json
{
  "distribution": [
    {
      "rating": 8,
      "count": 45,
      "percentage": 23.5
    },
    {
      "rating": 9,
      "count": 67,
      "percentage": 35.1
    }
  ],
  "statistics": {
    "mean": 7.8,
    "median": 8,
    "mode": 9,
    "std_dev": 1.2
  }
}
```

---

## Future Considerations

### Export/Reporting
- `/api/export/visits/` - CSV/Excel export
- `/api/reports/monthly/` - Pre-formatted reports

### Bulk Operations
- `/api/bulk-import/` - Import multiple visits
- `/api/bulk-update/` - Update multiple records

### Advanced Analytics
- `/api/predictions/visit-targets/` - ML-based visit predictions
- `/api/anomaly-detection/` - Flag unusual patterns
- `/api/recommendations/` - School/mentor pairing suggestions

---

## Implementation Checklist

When adding new endpoints:

- [ ] Add endpoint to Django views
- [ ] Register URL in urls.py
- [ ] Add authentication/permission checks
- [ ] Write unit tests
- [ ] Update Swagger/OpenAPI documentation
- [ ] Create TypeScript types in frontend
- [ ] Create API function in `/src/lib/api/mentors/`
- [ ] Update this documentation
- [ ] Update `api-endpoints.md` with new endpoint

