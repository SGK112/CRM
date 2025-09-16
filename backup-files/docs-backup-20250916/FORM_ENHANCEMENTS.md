# Enhanced Form Components - Setup Guide

## Overview

The CRM now includes enhanced form components with standardized phone number formatting (+1 format) and Google Maps integration for address autocomplete. This guide explains how to set up and use these features.

## Features

### 📞 Phone Number Formatting
- **Automatic +1 formatting**: All phone numbers are automatically formatted as `+1 (XXX) XXX-XXXX`
- **Smart input validation**: Only allows numeric input with automatic formatting
- **International support**: Handles US and Canadian phone numbers
- **Clean data storage**: Stores clean phone numbers with country code in the database

### 🗺️ Google Maps Integration
- **Address autocomplete**: Real-time address suggestions as users type
- **Automatic form filling**: Selecting an address automatically fills city, state, ZIP, and country
- **Geocoding**: Stores latitude/longitude coordinates for mapping features
- **Fallback support**: Works as a regular address form if Google Maps is unavailable

## Setup Instructions

### 1. Google Maps API Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Required APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API (optional, for additional features)

3. **Create API Key**:
   - Go to Credentials section
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Configure API Key Restrictions** (Recommended):
   - Application restrictions: HTTP referrers
   - Add your domain: `http://localhost:*` for development
   - Add production domain for deployment
   - API restrictions: Select the enabled APIs above

### 2. Environment Configuration

Add your Google Maps API key to the frontend environment file:

```bash
# apps/frontend/.env.local

# Google Maps API Configuration
# Get your API key from: https://console.cloud.google.com/apis/credentials
# Enable: Maps JavaScript API, Places API, Geocoding API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

### 3. Cost Considerations

Google Maps API pricing (as of 2024):
- **Places Autocomplete**: $17 per 1,000 requests
- **Geocoding**: $5 per 1,000 requests
- **Maps JavaScript API**: Free up to 28,000 loads per month

**Cost Optimization Tips**:
- Set up billing alerts in Google Cloud Console
- Implement request caching
- Use API key restrictions to prevent unauthorized use
- Consider implementing usage quotas

## Using the Components

### PhoneInput Component

```tsx
import PhoneInput from '@/components/forms/PhoneInput';

<PhoneInput
  value={phone}
  onChange={(value) => setPhone(value)}
  placeholder="Phone number"
  required={true}
  className="input"
/>
```

**Props**:
- `value`: Current phone number value
- `onChange`: Callback function that receives formatted phone number
- `placeholder`: Input placeholder text
- `required`: Whether the field is required
- `disabled`: Whether the input is disabled
- `className`: CSS classes for styling

### AddressInput Component

```tsx
import AddressInput from '@/components/forms/AddressInput';

<AddressInput
  address={address}
  onChange={(address) => setAddress(address)}
  required={true}
  showCoordinates={true}
/>
```

**Props**:
- `address`: Address object with street, city, state, zipCode, country, latitude, longitude
- `onChange`: Callback function that receives complete address object
- `required`: Whether address fields are required
- `disabled`: Whether the inputs are disabled
- `showCoordinates`: Whether to display latitude/longitude coordinates
- `className`: Additional CSS classes

**Address Object Structure**:
```typescript
interface Address {
  street?: string;
  city?: string;
  state?: string;        // Auto-formatted to uppercase, 2 characters
  zipCode?: string;      // Numbers only, auto-limited by country
  country?: string;      // Default: 'US', options: 'US', 'CA'
  latitude?: number;     // From Google Maps geocoding
  longitude?: number;    // From Google Maps geocoding
}
```

## Form Updates

The following forms have been updated to use the new components:

### Client Forms
- ✅ **New Client**: `/dashboard/clients/new`
- ✅ **Edit Client**: `/dashboard/clients/[id]/edit`

### User Registration
- ✅ **Register**: `/auth/register`

### Project Forms
- ✅ **New Project**: `/dashboard/projects/new` (client creation section)

## Features in Action

### Phone Number Formatting
- **User types**: `5551234567`
- **Displays**: `+1 (555) 123-4567`
- **Stores**: `15551234567`

### Address Autocomplete
1. User starts typing: `123 Main`
2. Google suggestions appear:
   - `123 Main Street, Anytown, CA, USA`
   - `123 Main Avenue, Another City, CA, USA`
3. User selects suggestion
4. Form auto-fills:
   - Street: `123 Main Street`
   - City: `Anytown`
   - State: `CA`
   - ZIP: `90210`
   - Country: `US`
   - Coordinates: `34.0522, -118.2437`

## Troubleshooting

### Google Maps Not Loading
1. **Check API Key**: Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
2. **Verify API Restrictions**: Check that your domain is allowed in Google Cloud Console
3. **Check Browser Console**: Look for specific error messages
4. **Billing**: Ensure billing is enabled in Google Cloud Console

### Phone Formatting Issues
1. **International Numbers**: Component currently optimized for US/CA numbers
2. **Existing Data**: Old phone numbers may need migration to new format
3. **Display vs Storage**: Ensure you're using the clean value for API calls

### Address Validation
1. **Geocoding Accuracy**: Google suggestions may not always be 100% accurate
2. **Manual Entry**: Users can still manually enter addresses if autocomplete fails
3. **Coordinate Storage**: Coordinates are optional and used for mapping features

## Migration Guide

### Existing Phone Numbers
If you have existing phone numbers in different formats, you may want to run a data migration:

```sql
-- Example migration for standardizing phone numbers
UPDATE clients 
SET phone = CONCAT('1', REGEXP_REPLACE(phone, '[^0-9]', ''))
WHERE phone IS NOT NULL 
AND phone NOT LIKE '1%'
AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '')) = 10;
```

### Existing Addresses
Address objects now support coordinates. Existing addresses will continue to work, but won't have geocoding data until updated.

## Security Considerations

1. **API Key Protection**: Never expose API keys in client-side code without restrictions
2. **Domain Restrictions**: Always restrict API keys to specific domains
3. **Rate Limiting**: Consider implementing rate limiting for API calls
4. **Data Privacy**: Inform users about location data collection for mapping features

## Future Enhancements

Planned improvements:
- International phone number support
- Address validation for commercial vs residential
- Integration with shipping APIs
- Batch geocoding for existing addresses
- Custom map views in client/project details
