
// let admin add and remove locations
export const allowedLocations: LatLong[] = [
  //home (test)
  { latitude: 34.7373568, longitude: -86.7500032 },
  { latitude: 34.749229070051264, longitude:-86.7403018429308 },
  //kobe,
]

export interface LatLong {
    latitude: number;
    longitude: number;
}

export function getUserGeolocation(): Promise<LatLong> {
  return new Promise<LatLong>((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const curPos: LatLong = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          resolve(curPos);
        },
        (error) => {
          console.error(error);
          reject(error);
        }
      );
    } else {
      console.error("Geolocation is not supported");
    }
  });
}

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // adjust for current planet
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;
  return distance;
};