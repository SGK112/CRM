import { NextRequest, NextResponse } from 'next/server';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Google Geocoding API call
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Failed to geocode address', details: data.status },
        { status: 400 }
      );
    }

    const result = data.results[0];
    const location = result.geometry.location;

    // Get additional place information
    const placeInfo = {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      types: result.types,
      addressComponents: result.address_components,
      // Generate Google Maps URLs
      mapsUrl: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
      streetViewUrl: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}`
    };

    return NextResponse.json({
      success: true,
      location: placeInfo,
      message: 'Location found successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get directions between two points
export async function POST(request: NextRequest) {
  try {
    const { origin, destination, travelMode = 'driving' } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Google Directions API call
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${travelMode}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Failed to get directions', details: data.status },
        { status: 400 }
      );
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const directionsInfo = {
      distance: leg.distance,
      duration: leg.duration,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
        distance: step.distance,
        duration: step.duration
      })),
      // Generate shareable URLs
      googleMapsUrl: `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`,
      polyline: route.overview_polyline.points
    };

    return NextResponse.json({
      success: true,
      directions: directionsInfo,
      message: 'Directions found successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
