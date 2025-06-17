# Member Module Updates Documentation

## 1. New Fields Added

### Interest Categories
```typescript
enum InterestCategory {
  FREE_SKILLS
  MOVIE_ACADEMY
  SHOP_FOR_FREE
  FREE_CENTER_FOR_EDUCATION
  FREE_SPORTS_ACADEMY
}
```
- Type: Array of InterestCategory
- Required: No
- Example: `['FREE_SKILLS', 'MOVIE_ACADEMY']`

### Education Level
```typescript
enum EducationLevel {
  PRIMARY
  SSCE
  GRADUATE
  POST_GRADUATE
}
```
- Type: Single value from EducationLevel enum
- Required: No
- Example: `'GRADUATE'`

### Age Range
```typescript
enum AgeRange {
  AGE_15_20
  AGE_21_30
  AGE_31_40
  AGE_41_50
  AGE_51_ABOVE
}
```
- Type: Single value from AgeRange enum
- Required: No
- Example: `'AGE_21_30'`

### Birth Date
- Format: `DD-MM` (e.g., "15-01" for January 15th)
- Required: No
- Validation: Must match pattern `^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$`
- Example: `'15-01'`

### Bad Comment
- Type: String
- Required: No
- Description: For negative feedback or concerns about the church/organization
- Example: `'Parking space needs improvement'`

## 2. API Endpoints

### Create Member
```typescript
POST /members
```
Request Body:
```typescript
{
  // Required fields
  name: string;
  phone: string;
  address: string;
  gender: string;
  zoneId: string;
  cellId: string;

  // Optional fields
  email?: string;
  status?: MemberStatus;              // Defaults to FIRST_TIMER
  conversionStatus?: ConversionStatus; // Defaults to NOT_CONVERTED
  sundayAttendance?: number;          // Defaults to 0
  firstVisitDate?: string;            // For historical data
  conversionDate?: string;            // For conversion tracking
  interests?: InterestCategory[];     // Optional array of interests
  educationLevel?: EducationLevel;    // Optional education level
  ageRange?: AgeRange;                // Optional age range
  birthDate?: string;                 // Optional DD-MM format
  badComment?: string;                // Optional feedback
  prayerRequest?: string;             // Optional prayer request
}
```

Note: The `/members/register` endpoint is an alias for `/members` and should not be used. Always use the `/members` endpoint for creating new members.

### Get Members (with filters)
```typescript
GET /members
```
Query Parameters:
```typescript
{
  status?: MemberStatus;              // Filter by member status
  conversionStatus?: ConversionStatus; // Filter by conversion status
  zoneId?: string;                    // Filter by zone
  cellId?: string;                    // Filter by cell
  search?: string;                    // Search in name, phone, email
  firstVisitStart?: string;           // Filter by first visit date range
  firstVisitEnd?: string;
  lastVisitStart?: string;            // Filter by last visit date range
  lastVisitEnd?: string;
  limit?: number;                     // Pagination limit
  offset?: number;                    // Pagination offset
}
```

### Update Member
```typescript
PATCH /members/:id
```
Request Body: Same as Create Member, all fields optional

### Search Member
```typescript
GET /members/search?phone=string&email=string
```
Response includes:
```typescript
{
  exists: boolean;
  member: {
    // ... member details including new fields ...
  };
  suggestedAction: string[];  // Array of suggested actions
}
```

#### Suggested Actions
The `suggestedAction` array can contain one or more of the following values:

1. **Status Update Suggestions**
   - `'UPDATE_TO_SECOND_TIMER'`: When a first timer has attended at least one service
   - `'UPDATE_TO_FULL_MEMBER'`: When a second timer has attended at least two services
   - `'NO_ACTION_NEEDED'`: When no status update is required

2. **Conversion Status Suggestions**
   - `'UPDATE_CONVERSION_STATUS'`: When member is not converted

Example Response:
```json
{
  "exists": true,
  "member": {
    "id": "uuid",
    "name": "John Doe",
    "status": "FIRST_TIMER",
    "sundayAttendance": 1,
    "conversionStatus": "NOT_CONVERTED"
  },
  "suggestedAction": [
    "UPDATE_TO_SECOND_TIMER",
    "UPDATE_CONVERSION_STATUS"
  ]
}
```

Usage Example:
```typescript
const checkMemberAndGetSuggestions = async (phone: string, email: string) => {
  const response = await api.get('/members/search', {
    params: { phone, email }
  });
  
  if (response.data.exists) {
    const { member, suggestedAction } = response.data;
    
    // Handle suggested actions
    if (suggestedAction.includes('UPDATE_TO_SECOND_TIMER')) {
      // Show UI for updating to second timer
    }
    if (suggestedAction.includes('UPDATE_CONVERSION_STATUS')) {
      // Show UI for updating conversion status
    }
    
    return { member, suggestedAction };
  }
  
  return { exists: false };
};
```

## 3. Frontend Implementation Guide

### Form Implementation
1. **Interest Categories**
   ```typescript
   // Multi-select component
   const interestOptions = [
     { value: 'FREE_SKILLS', label: 'Free Skills' },
     { value: 'MOVIE_ACADEMY', label: 'Movie Academy' },
     { value: 'SHOP_FOR_FREE', label: 'Shop for Free' },
     { value: 'FREE_CENTER_FOR_EDUCATION', label: 'Free Center for Education' },
     { value: 'FREE_SPORTS_ACADEMY', label: 'Free Sports Academy' }
   ];
   ```

2. **Education Level**
   ```typescript
   // Single select component
   const educationOptions = [
     { value: 'PRIMARY', label: 'Primary' },
     { value: 'SSCE', label: 'SSCE' },
     { value: 'GRADUATE', label: 'Graduate' },
     { value: 'POST_GRADUATE', label: 'Post Graduate' }
   ];
   ```

3. **Age Range**
   ```typescript
   // Single select component
   const ageRangeOptions = [
     { value: 'AGE_15_20', label: '15-20' },
     { value: 'AGE_21_30', label: '21-30' },
     { value: 'AGE_31_40', label: '31-40' },
     { value: 'AGE_41_50', label: '41-50' },
     { value: 'AGE_51_ABOVE', label: '51 and above' }
   ];
   ```

4. **Birth Date**
   ```typescript
   // Date input component
   // Format: DD-MM
   // Validation: Must match pattern ^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$
   const birthDateInput = {
     format: 'DD-MM',
     placeholder: 'DD-MM',
     mask: '99-99'
   };
   ```

### Data Display
1. **Member List**
   - Add columns for new fields
   - Format birth date for display
   - Show interests as tags/chips

2. **Member Details**
   - Add sections for new information
   - Format enums for display
   - Show bad comments with appropriate styling

### Search Implementation
```typescript
// Example search function
const searchMember = async (phone?: string, email?: string) => {
  const response = await api.get('/members/search', {
    params: { phone, email }
  });
  
  if (response.data.exists) {
    // Handle existing member
    const { member, suggestedAction } = response.data;
    // Show member details and suggested actions
  } else {
    // Handle new member
  }
};
```

## 4. Validation Rules

1. **Birth Date**
   - Must be in DD-MM format
   - Day must be 01-31
   - Month must be 01-12
   - Example valid dates: "01-01", "15-12", "31-01"

2. **Interests**
   - Can be empty
   - Must be valid enum values
   - Can have multiple values

3. **Education Level & Age Range**
   - Must be valid enum values
   - Can be null/undefined

## 5. Error Handling

1. **Birth Date Format**
   ```typescript
   // Frontend validation
   const validateBirthDate = (date: string) => {
     const pattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$/;
     return pattern.test(date);
   };
   ```

2. **API Errors**
   - 400: Invalid format for birth date
   - 400: Invalid enum values
   - 409: Email already exists

## 6. Example API Responses

### Create Member Success
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "interests": ["FREE_SKILLS", "MOVIE_ACADEMY"],
  "educationLevel": "GRADUATE",
  "ageRange": "AGE_21_30",
  "birthDate": "15-01",
  "badComment": null,
  "status": "FIRST_TIMER",
  "conversionStatus": "NOT_CONVERTED"
}
```

### Search Member Response
```json
{
  "exists": true,
  "member": {
    "id": "uuid",
    "name": "John Doe",
    "interests": ["FREE_SKILLS"],
    "educationLevel": "GRADUATE",
    "ageRange": "AGE_21_30",
    "birthDate": "15-01"
  },
  "suggestedAction": ["UPDATE_TO_SECOND_TIMER"]
}
```

## 7. Best Practices

1. **Form Handling**
   - Use controlled components for all inputs
   - Implement client-side validation before submission
   - Show validation errors inline

2. **Data Display**
   - Format enums for better readability
   - Use appropriate UI components for each field type
   - Implement proper error states

3. **Error Handling**
   - Implement proper error boundaries
   - Show user-friendly error messages
   - Handle network errors gracefully

4. **Performance**
   - Implement proper loading states
   - Use pagination for member lists
   - Cache member data when appropriate

## 8. Member Status Management

### Creating Different Member Types

1. **First Timer**
```typescript
// Normal registration
POST /members
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St",
  "gender": "male",
  "zoneId": "zone-uuid",
  "cellId": "cell-uuid",
  "status": "FIRST_TIMER",
  "conversionStatus": "NOT_CONVERTED"
}

// Historical registration (with first visit date)
POST /members
{
  // ... same as above ...
  "firstVisitDate": "2024-01-01",  // Date of first visit
  "sundayAttendance": 1            // Number of Sunday services attended
}
```

2. **Second Timer**
```typescript
// Check if member exists first
GET /members/search?phone=+1234567890&email=john@example.com

// If member exists, update status
PATCH /members/:id
{
  "status": "SECOND_TIMER",
  "sundayAttendance": 2
}

// If new member, create with status
POST /members
{
  // ... basic info ...
  "status": "SECOND_TIMER",
  "sundayAttendance": 2,
  "firstVisitDate": "2024-01-01"  // Historical first visit
}
```

3. **New Convert**
```typescript
// Check if member exists first
GET /members/search?phone=+1234567890&email=john@example.com

// If member exists, update conversion status
PATCH /members/:id
{
  "conversionStatus": "NEW_CONVERT",
  "conversionDate": "2024-01-15"  // Date of conversion
}

// If new member, create with conversion status
POST /members
{
  // ... basic info ...
  "conversionStatus": "NEW_CONVERT",
  "conversionDate": "2024-01-15",
  "firstVisitDate": "2024-01-01"  // Historical first visit
}
```

### Marking Attendance

```typescript
// Mark attendance for a member
POST /members/:id/attendance
{
  "attendanceDate": "2024-01-15"  // Optional, defaults to current date
}

// Response
{
  "id": "member-uuid",
  "sundayAttendance": 3,  // Updated attendance count
  "status": "FULL_MEMBER",  // Status updated if attendance threshold reached
  "lastVisit": "2024-01-15T00:00:00.000Z"
}
```

### Status Update Rules

1. **First Timer to Second Timer**
   - Automatically updates after first Sunday attendance
   - Can be manually set for historical data
   - Requires `firstVisitDate` for historical entries

2. **Second Timer to Full Member**
   - Automatically updates after third Sunday attendance
   - Can be manually set for historical data
   - Requires `sundayAttendance` count

3. **Conversion Status**
   - Can be set to `NEW_CONVERT` or `REDEDICATED`
   - Requires `conversionDate`
   - Can be set independently of member status

### Best Practices for Status Management

1. **New Member Registration**
   - Always check if member exists using search endpoint
   - Use appropriate status based on attendance history
   - Include historical data if available

2. **Attendance Tracking**
   - Mark attendance regularly
   - System automatically updates status based on attendance count
   - Can handle historical attendance data

3. **Conversion Tracking**
   - Record conversion date
   - Can be updated independently of attendance
   - Supports both new converts and rededications

4. **Historical Data**
   - Include `firstVisitDate` for accurate status tracking
   - Set appropriate `sundayAttendance` count
   - Use `conversionDate` for conversion status

### Example Status Update Flow

```typescript
// 1. Check if member exists
const checkMember = async (phone: string, email: string) => {
  const response = await api.get('/members/search', {
    params: { phone, email }
  });
  
  if (response.data.exists) {
    // Member exists, update status
    return updateMemberStatus(response.data.member.id);
  } else {
    // Create new member
    return createNewMember();
  }
};

// 2. Update member status
const updateMemberStatus = async (memberId: string) => {
  const response = await api.patch(`/members/${memberId}`, {
    status: 'SECOND_TIMER',
    sundayAttendance: 2
  });
  return response.data;
};

// 3. Mark attendance
const markAttendance = async (memberId: string) => {
  const response = await api.post(`/members/${memberId}/attendance`);
  return response.data;
};
``` 