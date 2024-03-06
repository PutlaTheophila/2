var map;
        var markers = [];
        var polyline;

        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 0, lng: 0 },
                zoom: 2
            });

            fetchDataAndUpdateMap();
            // Fetch data and update map every 3 seconds
            setInterval(fetchDataAndUpdateMap, 3000);
        }

        function fetchDataAndUpdateMap() {
            const apiKey = 'AIzaSyAMDCqRKW6XPHJvxKYqvgr24r4RfhrjAss';
    const spreadsheetId = '1HObmilSg2FHjOtueg9tvRn9N7lwkZAt8RYnRw08v-80';
            const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1?key=${apiKey}`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => updateMap(data.values))
                .catch(error => console.error('Error fetching data:', error));
        }

        function updateMap(data) {
            // Clear existing markers and polyline
            markers.forEach(marker => marker.setMap(null));
            markers = [];
            if (polyline) {
                polyline.setMap(null);
            }

            if (data.length < 2) {
                console.error('Not enough coordinates to connect.');
                return;
            }

            // Assuming your data has columns: Name, Latitude, Longitude
            // Sort the data array based on latitude in descending order
            data.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

            // Take the top two coordinates
            const topCoordinates = data.slice(0, 2);

            // Create markers for the top two coordinates
            topCoordinates.forEach((coord, index) => {
                const name = coord[0];
                const latitude = parseFloat(coord[2]); // Change to 3rd column for latitude
                const longitude = parseFloat(coord[3]); // Change to 4th column for longitude

                if (!isNaN(latitude) && !isNaN(longitude)) {
                    const marker = new google.maps.Marker({
                        position: { lat: latitude, lng: longitude },
                        map: map,
                        label: (index + 1).toString(), // Display the number as label
                        title: name
                    });
                    markers.push(marker);
                }
            });

            // Create a Polyline between the top two coordinates
            const coordinates = topCoordinates.map(coord => {
                const latitude = parseFloat(coord[2]); // Change to 3rd column for latitude
                const longitude = parseFloat(coord[3]); // Change to 4th column for longitude
                return { lat: latitude, lng: longitude };
            });

            polyline = new google.maps.Polyline({
                path: coordinates,
                geodesic: true,
                strokeColor: '#FF0000', // Line color
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            polyline.setMap(map);
        }

        function displayCoordinates() {
            const apiKey = 'AIzaSyAMDCqRKW6XPHJvxKYqvgr24r4RfhrjAss';
    const spreadsheetId = '1HObmilSg2FHjOtueg9tvRn9N7lwkZAt8RYnRw08v-80';
            const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1?key=${apiKey}`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => showCoordinatesTable(data.values))
                .catch(error => console.error('Error fetching data:', error));
        }

        function showCoordinatesTable(data) {
            const coordinatesTable = document.getElementById('coordinatesTable');
            coordinatesTable.innerHTML = ''; // Clear existing table

            // Assuming your data has columns: Name, Latitude, Longitude
            const headerRow = coordinatesTable.insertRow(0);
            ['Name', 'Latitude', 'Longitude'].forEach((column, index) => {
                const th = document.createElement('th');
                th.innerHTML = column;
                headerRow.appendChild(th);
            });

            data.forEach((row, rowIndex) => {
                const newRow = coordinatesTable.insertRow(rowIndex + 1);
                row.forEach((cell, cellIndex) => {
                    const cellElement = newRow.insertCell(cellIndex);
                    cellElement.innerHTML = cell;
                });
            });

            // Hide the map section
            document.getElementById('map').style.display = 'none';
            // Show the coordinates section
            document.getElementById('coordinates').style.display = 'block';
        }

        function toggleSection(section) {
            if (section === 'map') {
                // Show the map section
                document.getElementById('map').style.display = 'block';
                // Hide the coordinates section
                document.getElementById('coordinates').style.display = 'none';
                // Fetch data and update map immediately
                fetchDataAndUpdateMap();
                // Fetch data and update map every 3 seconds
                setInterval(fetchDataAndUpdateMap, 3000);
            } else if (section === 'coordinates') {
                // Stop fetching and updating map
                clearInterval();
                // Show the coordinates section
                document.getElementById('coordinates').style.display = 'block';
                // Hide the map section
                document.getElementById('map').style.display = 'none';
                // Fetch and display coordinates immediately
                displayCoordinates();
            }
        }