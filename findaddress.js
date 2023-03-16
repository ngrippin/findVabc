function findAddress() {
  const addressInput = document.getElementById("address").value;
  const websiteInput = document.getElementById("website").value;

  fetch(websiteInput)
    .then(response => response.text())
    .then(html => {
      const regex = /\d+\s\w+\s\w+/g;
      const addresses = html.match(regex);
      
      // use the OpenStreetMap Nominatim API to geocode the input address
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${addressInput}&format=json`;
      fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
          const inputLat = data[0].lat;
          const inputLon = data[0].lon;

          // calculate the distance between each address and the input address
          let closestAddress;
          let closestDistance = Infinity;
          addresses.forEach(address => {
            const addressUrl = `https://nominatim.openstreetmap.org/search?q=${address}&format=json`;
            fetch(addressUrl)
              .then(response => response.json())
              .then(data => {
                const addressLat = data[0].lat;
                const addressLon = data[0].lon;
                const distance = getDistanceFromLatLonInKm(inputLat, inputLon, addressLat, addressLon);

                if (distance < closestDistance) {
                  closestAddress = address;
                  closestDistance = distance;
                }
              });
          });

          // display the closest address
          const resultDiv = document.createElement("div");
          const resultText = document.createTextNode(`The closest address is ${closestAddress} (distance: ${closestDistance.toFixed(2)} km)`);
          resultDiv.appendChild(resultText);
          document.body.appendChild(resultDiv);
        });
    })
    .catch(error => console.log(error));
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
