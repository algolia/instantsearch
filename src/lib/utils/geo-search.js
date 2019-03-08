const latLngRegExp = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;

export function aroundLatLngToPosition(value) {
  const pattern = value.match(latLngRegExp);

  // Since the value provided is the one send with the request, the API should
  // throw an error due to the wrong format. So throw an error should be safe.
  if (!pattern) {
    throw new Error(`Invalid value for "aroundLatLng" parameter: "${value}"`);
  }

  return {
    lat: parseFloat(pattern[1]),
    lng: parseFloat(pattern[2]),
  };
}

export function insideBoundingBoxArrayToBoundingBox(value) {
  const [[neLat, neLng, swLat, swLng] = []] = value;

  // Since the value provided is the one send with the request, the API should
  // throw an error due to the wrong format. So throw an error should be safe.
  if (!neLat || !neLng || !swLat || !swLng) {
    throw new Error(
      `Invalid value for "insideBoundingBox" parameter: [${value}]`
    );
  }

  return {
    northEast: {
      lat: neLat,
      lng: neLng,
    },
    southWest: {
      lat: swLat,
      lng: swLng,
    },
  };
}

export function insideBoundingBoxStringToBoundingBox(value) {
  const [neLat, neLng, swLat, swLng] = value.split(',').map(parseFloat);

  // Since the value provided is the one send with the request, the API should
  // throw an error due to the wrong format. So throw an error should be safe.
  if (!neLat || !neLng || !swLat || !swLng) {
    throw new Error(
      `Invalid value for "insideBoundingBox" parameter: "${value}"`
    );
  }

  return {
    northEast: {
      lat: neLat,
      lng: neLng,
    },
    southWest: {
      lat: swLat,
      lng: swLng,
    },
  };
}

export function insideBoundingBoxToBoundingBox(value) {
  if (Array.isArray(value)) {
    return insideBoundingBoxArrayToBoundingBox(value);
  }

  return insideBoundingBoxStringToBoundingBox(value);
}
