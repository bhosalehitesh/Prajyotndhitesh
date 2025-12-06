# Pincode Validation API Documentation

## Overview
A comprehensive pincode validation system that validates pincodes according to state, district, and city. The system includes:
- Database model for storing pincode data with state, district, city, taluka, division, and region
- REST API endpoints for validation and lookup
- Frontend integration for real-time validation

## Database Schema

### Pincode Entity
- `id`: Primary key
- `pincode`: 6-digit pincode (indexed)
- `state`: State name (indexed)
- `district`: District name (indexed)
- `city`: City/Town name (indexed)
- `taluka`: Taluka/Tehsil (optional)
- `division`: Division (optional)
- `region`: Region (optional)

## API Endpoints

### 1. Validate Pincode
**GET** `/api/pincodes/validate?pincode=411103`

**Response:**
```json
{
  "valid": true,
  "pincode": "411103",
  "state": "Maharashtra",
  "district": "Pune",
  "city": "Pune",
  "taluka": "Pune",
  "division": "Pune"
}
```

### 2. Check Pincode for State
**GET** `/api/pincodes/check-state?pincode=411103&state=Maharashtra`

**Response:**
```json
{
  "valid": true,
  "pincode": "411103",
  "state": "Maharashtra",
  "message": "Pincode is valid for the selected state"
}
```

### 3. Get Districts by State
**GET** `/api/pincodes/districts?state=Maharashtra`

**Response:**
```json
["Pune", "Mumbai", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur"]
```

### 4. Get Cities by State/District
**GET** `/api/pincodes/cities?state=Maharashtra`
**GET** `/api/pincodes/cities?state=Maharashtra&district=Pune`

**Response:**
```json
["Pune", "Pimpri-Chinchwad", "Hadapsar", "Kharadi"]
```

### 5. Get All States
**GET** `/api/pincodes/states`

**Response:**
```json
["Andhra Pradesh", "Maharashtra", "Karnataka", ...]
```

### 6. Get Pincode Details
**GET** `/api/pincodes/{pincode}`

**Response:**
```json
{
  "id": 1,
  "pincode": "411103",
  "state": "Maharashtra",
  "district": "Pune",
  "city": "Pune",
  "taluka": "Pune",
  "division": "Pune",
  "region": "West"
}
```

### 7. Search Pincodes
**GET** `/api/pincodes/search?prefix=411`

**Response:**
```json
[
  {
    "id": 1,
    "pincode": "411001",
    "state": "Maharashtra",
    "district": "Pune",
    "city": "Pune"
  },
  ...
]
```

## Frontend Integration

The frontend (`LocationDetailsScreen.tsx`) now:
1. **Fetches states from API** on component mount
2. **Loads districts** when a state is selected
3. **Loads cities** based on state (and optionally district)
4. **Validates pincode in real-time** as user types
5. **Auto-populates city and district** when a valid pincode is entered

### Features:
- ✅ Real-time pincode validation
- ✅ Auto-population of city/district from pincode
- ✅ District dropdown (optional but helpful)
- ✅ City dropdown filtered by state/district
- ✅ Loading indicators during API calls
- ✅ Fallback to hardcoded data if API fails

## Data Loading

### Automatic Data Loader
The `PincodeDataLoader` component automatically loads sample pincode data when the application starts (only if database is empty).

**Sample data includes:**
- Pune district: 411001-411105
- Mumbai district: 400001-400005
- Nagpur district: 440001-440003
- Nashik district: 422001-422003
- Thane district: 400601-400603
- Aurangabad district: 431001-431003
- Solapur district: 413001-413003

### Loading Full Pincode Database

For production, you'll need to load a complete pincode database. Options:

1. **CSV Import**: Create a script to import from CSV file
2. **External API**: Use India Post API or similar services
3. **Manual Entry**: Use the `/api/pincodes` POST endpoint (if created)

## Usage Example

### Backend Test:
```bash
# Validate pincode
curl http://localhost:8080/api/pincodes/validate?pincode=411103

# Check for state
curl http://localhost:8080/api/pincodes/check-state?pincode=411103&state=Maharashtra

# Get districts
curl http://localhost:8080/api/pincodes/districts?state=Maharashtra

# Get cities
curl http://localhost:8080/api/pincodes/cities?state=Maharashtra&district=Pune
```

### Frontend Usage:
The `LocationDetailsScreen` automatically uses these APIs. Users will:
1. Select a state from dropdown
2. Optionally select a district
3. Select a city (filtered by state/district)
4. Enter pincode (validated in real-time)
5. City/district auto-populated if pincode is valid

## Notes

- The pincode validation is **case-sensitive** for state names
- Pincode must be exactly **6 digits**
- All API endpoints support CORS for frontend access
- The system falls back to hardcoded data if API is unavailable
- District field is optional but helps filter cities

## Next Steps

1. **Load complete pincode database** - Currently only sample data is loaded
2. **Add bulk import endpoint** - For importing CSV files
3. **Add caching** - For better performance
4. **Add pincode search by city** - Reverse lookup functionality


