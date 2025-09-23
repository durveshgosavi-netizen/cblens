import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Geolocation } from '@capacitor/geolocation';
import { useToast } from "@/hooks/use-toast";

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

interface CanteenLocation {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const canteenLocations: CanteenLocation[] = [
  {
    id: 'main-campus',
    name: 'Main Campus Canteen',
    address: 'Building A, Ground Floor',
    coordinates: { latitude: 55.6761, longitude: 12.5683 } // Copenhagen coordinates
  },
  {
    id: 'north-building',
    name: 'North Building Café',
    address: 'Building B, 2nd Floor',
    coordinates: { latitude: 55.6801, longitude: 12.5723 }
  },
  {
    id: 'south-campus',
    name: 'South Campus Dining',
    address: 'Building C, Ground Floor',
    coordinates: { latitude: 55.6721, longitude: 12.5643 }
  }
];

export default function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
  const [currentPosition, setCurrentPosition] = useState<{latitude: number, longitude: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [nearestLocation, setNearestLocation] = useState<string | null>(null);
  const { toast } = useToast();

  const requestLocationPermission = async () => {
    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      // Request permissions first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        toast({
          title: "Location Permission Required",
          description: "Please enable location access to find nearby canteens",
          variant: "destructive"
        });
        return;
      }

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const position = {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude
      };

      setCurrentPosition(position);
      
      // Find nearest canteen
      const nearest = findNearestCanteen(position);
      if (nearest) {
        setNearestLocation(nearest.id);
        toast({
          title: "Location Found",
          description: `Nearest canteen: ${nearest.name}`,
        });
      }

    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location Error",
        description: "Could not get your current location. Please select manually.",
        variant: "destructive"
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  const calculateDistance = (pos1: {latitude: number, longitude: number}, pos2: {latitude: number, longitude: number}) => {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestCanteen = (position: {latitude: number, longitude: number}) => {
    let nearest = null;
    let minDistance = Infinity;

    canteenLocations.forEach(location => {
      if (location.coordinates) {
        const distance = calculateDistance(position, location.coordinates);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = location;
        }
      }
    });

    return nearest;
  };

  const getDistanceText = (location: CanteenLocation) => {
    if (!currentPosition || !location.coordinates) return '';
    const distance = calculateDistance(currentPosition, location.coordinates);
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Select Location</h3>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={getCurrentLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {loadingLocation ? 'Finding...' : 'Near Me'}
          </Button>
        </div>

        <div className="space-y-3">
          {canteenLocations.map((location) => {
            const isSelected = selectedLocation === location.name;
            const isNearest = nearestLocation === location.id;
            const distance = getDistanceText(location);

            return (
              <div
                key={location.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
                onClick={() => onLocationChange(location.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{location.name}</h4>
                      {isNearest && (
                        <Badge variant="secondary" className="text-xs">
                          Nearest
                        </Badge>
                      )}
                      {distance && (
                        <Badge variant="outline" className="text-xs">
                          {distance}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {currentPosition && (
          <div className="mt-4 p-3 bg-accent/30 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Current location: {currentPosition.latitude.toFixed(4)}, {currentPosition.longitude.toFixed(4)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}