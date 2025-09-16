# Google Maps Integration Setup

## Overview

Google Maps has been integrated into the client detail page (`/dashboard/clients/[id]`) to display client addresses on an interactive map.

## Features

- **Address Display**: Shows client address information in a structured format
- **Interactive Map**: Embedded Google Map with custom dark theme to match the CRM design
- **Geocoding**: Automatically converts addresses to map coordinates
- **Custom Markers**: Amber-colored markers that match the CRM's color scheme
- **Responsive Design**: Map adapts to different screen sizes

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (required)
   - **Geocoding API** (required)
   - **Places API** (optional, for enhanced features)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables

Add your API key to `/apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important**: The `NEXT_PUBLIC_` prefix is required for the API key to be accessible in the browser.

### 3. Test the Integration

1. Navigate to `http://localhost:3005/dashboard/clients/1`
2. The map should load in the "Location" section of the Overview tab
3. The map will show the client's address with a custom amber marker

## File Structure

```
apps/frontend/
├── components/
│   └── GoogleMap.tsx           # Reusable Google Maps component
├── app/dashboard/clients/[id]/
│   └── page.tsx               # Client detail page with map integration
├── lib/
│   └── shared-storage.ts      # Mock data with address fields
└── .env.local                 # Environment variables (API key)
```

## Current Address Data

The system includes sample address data for testing:

- **Client 1 (Johnson Family)**: 123 Oak Street, New York, NY 10001
- **Client 2 (Martinez Construction)**: 456 Pine Avenue, Los Angeles, CA 90210

## Map Features

- **Dark Theme**: Matches the CRM's black/slate color scheme
- **Custom Markers**: Amber-colored circular markers
- **Automatic Centering**: Map centers on the client's address
- **Zoom Level**: Set to 15 for neighborhood-level detail
- **Fallback**: Shows helpful error messages if API key is missing or invalid

## Browser Support

- Modern browsers with JavaScript enabled
- Mobile-responsive design for touch interaction
- Graceful degradation if maps fail to load

## Security Considerations

- API key should be restricted to your domain
- Consider implementing usage quotas to control costs
- Monitor API usage in Google Cloud Console

## Future Enhancements

- **Driving Directions**: Add directions from user's location
- **Multiple Locations**: Show multiple client locations on one map
- **Address Validation**: Validate addresses during data entry
- **Street View**: Integrate Street View for property inspection
- **Custom Map Styles**: Additional theme options

## Troubleshooting

- **Map not loading**: Check API key and browser console for errors
- **Geocoding failed**: Verify address format and API permissions
- **API quota exceeded**: Check usage limits in Google Cloud Console
- **CORS errors**: Ensure API key domain restrictions are correct
