# Google Maps Integration Setup

## Overview
The client profile page now includes Google Maps integration to display client locations on an interactive map.

## Features Added
✅ **Location Section** - New profile section for address information
✅ **Interactive Map** - Embedded Google Maps showing client location
✅ **Address Display** - Formatted address with coordinates
✅ **Map Actions** - Get directions and view in Google Maps buttons
✅ **Mobile Responsive** - Optimized for mobile and desktop viewing

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps Embed API
   - Maps JavaScript API (optional, for future enhancements)
4. Go to Credentials and create an API key
5. Restrict the API key to your domains for security

### 2. Configure Environment Variables
Add your Google Maps API key to your environment file:

```bash
# In .env.local or .env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

### 3. Test the Integration
1. Restart your development server
2. Navigate to a client profile page
3. The map should display if the client has location data
4. Test the "Get Directions" and "View in Google Maps" buttons

## Data Structure
The contact object now includes location fields:
- `address` - Street address
- `city` - City name
- `state` - State/province
- `zipCode` - ZIP/postal code
- `latitude` - Latitude coordinates (for map centering)
- `longitude` - Longitude coordinates (for map centering)

## Default Data
The example client now includes San Francisco coordinates:
- Address: 123 Main Street, San Francisco, CA 94105
- Coordinates: 37.7749, -122.4194

## Security Notes
- Use `NEXT_PUBLIC_` prefix to make the API key available to the frontend
- Restrict your API key to specific domains in production
- Consider implementing server-side geocoding for address-to-coordinates conversion
- Monitor API usage to avoid unexpected charges

## Future Enhancements
- Geocoding service to convert addresses to coordinates automatically
- Multiple locations per client (home, office, job sites)
- Custom map markers and styling
- Distance calculations between locations
- Service area mapping
