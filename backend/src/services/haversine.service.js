/**
 * Haversine formula — calculates great-circle distance between two coordinates.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometres
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Finds the nearest police station to the given coordinates.
 * @param {number} lat  - user latitude
 * @param {number} lng  - user longitude
 * @param {Array}  stations - array of PoliceStation documents
 * @returns {{ station: Object, distanceKm: number } | null}
 */
const findNearestStation = (lat, lng, stations) => {
  if (!stations || stations.length === 0) return null;

  let nearest = null;
  let minDist = Infinity;

  for (const station of stations) {
    const dist = haversineDistance(lat, lng, station.latitude, station.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearest = station;
    }
  }

  return { station: nearest, distanceKm: minDist };
};

export { haversineDistance, findNearestStation };
