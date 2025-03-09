// REVERSE GEOCODING

async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.address) {
      const address = data.address;

      return {
        house: address.house_number,
        road: address.road,
        neighbourhood: address.neighbourhood,
        city: address.city,
        town: address.town,
        village: address.village,
        state: address.state,
        postcode: address.postcode,
        country: address.country,
      };
    } else {
      throw new Error("Address not found.");
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "Address not found."; // Handle errors gracefully
  }
}

// Example usage (replace with your actual latitude and longitude):
async function getAddressFromLocation(latitude, longitude) {
  const address = await reverseGeocode(latitude, longitude);
  console.log("Address:", address);
}

// Example usage with getUserLocation function from previous response:
async function displayCurrentAddress() {
  try {
    const location = await getUserLocation(); // Assuming you have getUserLocation
    const address = await reverseGeocode(location.latitude, location.longitude);
    console.log("Your current address:", address);
  } catch (error) {
    console.error("Error:", error);
  }
}

//GETTING LATITUDE AND LONGITUDE

// ############################################################################
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        resolve({ latitude, longitude });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "User denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
          case error.UNKNOWN_ERROR:
            errorMessage = "An unknown error occurred.";
            break;
        }
        reject(new Error(errorMessage));
      }
    );
  });
}

// Example usage:
getUserLocation()
  .then(async (location) => {
    const { latitude, longitude } = location;
    console.log("User's location:", location);
    const results = await reverseGeocode(latitude, longitude); //CALL THE REVERSE GEOCODE FN HERE
    console.log("This is ", results);
    // You can now use location.latitude and location.longitude
  })
  .catch((error) => {
    console.error("Error getting location:", error.message);
  });
///################################################################################################

// calculate with proximity
///################################################################################################

function sortUsersByProximity(userLatitude, userLongitude, otherUsers) {
  /**
   * Calculates the distance between two coordinates using the Haversine formula.
   * @param {number} lat1 - Latitude of the first point.
   * @param {number} lon1 - Longitude of the first point.
   * @param {number} lat2 - Latitude of the second point.
   * @param {number} lon2 - Longitude of the second point.
   * @returns {number} - Distance in kilometers.
   */
  //Haversine
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Add distance to each user object
  const usersWithDistance = otherUsers.map((user) => {
    const distance = calculateDistance(
      userLatitude,
      userLongitude,
      user.latitude,
      user.longitude
    );
    return { ...user, distance };
  });
  //   /home/elvin/Videos/geo-location/geolocation.js
  // Sort users by distance
  usersWithDistance.sort((a, b) => a.distance - b.distance);

  // Return the sorted array, optionally removing the distance property
  return usersWithDistance.map(({ distance, ...user }) => user); // Remove distance prop.
  // if you want to keep the distance, just return usersWithDistance;
}

// Example usage:
const userLatitude = 37.7749; // Example user latitude
const userLongitude = -122.4194; // Example user longitude

const otherUsers = [
  { id: 1, name: "Alice", latitude: 37.788, longitude: -122.4075 },
  { id: 2, name: "Bob", latitude: 37.755, longitude: -122.4324 },
  { id: 3, name: "Charlie", latitude: 37.8, longitude: -122.45 },
];

const sortedUsers = sortUsersByProximity(
  userLatitude,
  userLongitude,
  otherUsers
);

console.log(sortedUsers);
