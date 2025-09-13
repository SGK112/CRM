import React, { useState, useEffect, useRef } from 'react';

// Google Maps type declarations
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: any;
          PlacesService: any;
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
  }
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressInputProps {
  address: Address;
  onChange: (address: Address) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showCoordinates?: boolean;
}

/**
 * Address input component with Google Maps autocomplete integration
 * Falls back to manual entry if Google Maps is not available
 */
export const AddressInput: React.FC<AddressInputProps> = ({
  address,
  onChange,
  className = '',
  required = false,
  disabled = false,
  showCoordinates = false,
}) => {
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        // No key configured; stay in manual entry mode without spamming errors
        console.info('Google Maps API key missing; AddressInput running in manual mode.');
        return;
      }
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        initializeServices();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleMapsLoaded(true);
        initializeServices();
      };
      script.onerror = () => {
        console.warn('Failed to load Google Maps API, falling back to manual entry');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeServices = () => {
    if (window.google && window.google.maps) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
    }
  };

  // Handle street address autocomplete
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateAddress({ street: value });

    if (autocompleteService && value.length > 2) {
      autocompleteService.getPlacePredictions(
        {
          input: value,
          types: ['address'],
          componentRestrictions: { country: ['us', 'ca'] }, // US and Canada
        },
        (predictions: any[], status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    if (placesService) {
      placesService.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['address_components', 'geometry', 'formatted_address'],
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const addressComponents = place.address_components;
            const newAddress: Address = {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US',
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng(),
            };

            // Parse address components
            addressComponents.forEach((component: any) => {
              const types = component.types;

              if (types.includes('street_number')) {
                newAddress.street = component.long_name + ' ';
              }
              if (types.includes('route')) {
                newAddress.street = (newAddress.street || '') + component.long_name;
              }
              if (types.includes('locality')) {
                newAddress.city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                newAddress.state = component.short_name;
              }
              if (types.includes('postal_code')) {
                newAddress.zipCode = component.long_name;
              }
              if (types.includes('country')) {
                newAddress.country = component.short_name;
              }
            });

            onChange(newAddress);
            setShowSuggestions(false);
          }
        }
      );
    }
  };

  const updateAddress = (updates: Partial<Address>) => {
    onChange({ ...address, ...updates });
  };

  // Format state input (auto-uppercase, limit to 2 chars)
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 2);
    updateAddress({ state: value });
  };

  // Format ZIP code (numbers only, limit based on country)
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Numbers only
    const maxLength = address.country === 'CA' ? 6 : 5; // Canadian postal codes can be 6 digits
    updateAddress({ zipCode: value.slice(0, maxLength) });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        streetInputRef.current &&
        !streetInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Street Address with Autocomplete */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            ref={streetInputRef}
            type="text"
            value={address.street || ''}
            onChange={handleStreetChange}
            placeholder="123 Main Street"
            className="input pr-10"
            required={required}
            disabled={disabled}
            autoComplete="street-address"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isGoogleMapsLoaded ? (
              <span className="text-green-500 text-sm">🗺️</span>
            ) : (
              <span className="text-gray-400 text-sm">🏠</span>
            )}
          </div>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
              >
                <div className="font-medium">{suggestion.structured_formatting?.main_text}</div>
                <div className="text-gray-500 text-xs">
                  {suggestion.structured_formatting?.secondary_text}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City, State, ZIP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={address.city || ''}
            onChange={e => updateAddress({ city: e.target.value })}
            placeholder="City"
            className="input"
            required={required}
            disabled={disabled}
            autoComplete="address-level2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={address.state || ''}
            onChange={handleStateChange}
            placeholder="CA"
            className="input uppercase"
            maxLength={2}
            required={required}
            disabled={disabled}
            autoComplete="address-level1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={address.zipCode || ''}
            onChange={handleZipChange}
            placeholder="12345"
            className="input"
            required={required}
            disabled={disabled}
            autoComplete="postal-code"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <select
          value={address.country || 'US'}
          onChange={e => updateAddress({ country: e.target.value })}
          className="input"
          disabled={disabled}
          autoComplete="country"
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </div>

      {/* Coordinates (if enabled and available) */}
      {showCoordinates && address.latitude && address.longitude && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Coordinates:</strong> {address.latitude.toFixed(6)},{' '}
          {address.longitude.toFixed(6)}
        </div>
      )}

      {/* Google Maps Attribution */}
      {isGoogleMapsLoaded && (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span>🗺️</span>
          <span>Powered by Google Maps</span>
        </div>
      )}
    </div>
  );
};

export default AddressInput;
