// Convert DMS to decimal degrees
function dmsToDecimal(degrees, minutes, seconds) {
    return degrees + (minutes / 60) + (seconds / 3600);
}

// Calculate azimuth using back azimuth and internal angle
function calculateAzimuth(prevAzimuth, internalAngle) {
    let azimuth = prevAzimuth + internalAngle;
    if (azimuth >= 360) azimuth -= 360;
    return azimuth;
}

// Calculate back azimuth
function backAzimuth(azimuth) {
    return (azimuth + 180) % 360;
}

// Calculate change in easting and northing
function calculateDeltas(azimuth, distance) {
    const azimuthRad = (azimuth * Math.PI) / 180; // Convert degrees to radians
    const deltaE = distance * Math.sin(azimuthRad);
    const deltaN = distance * Math.cos(azimuthRad);
    return { deltaE, deltaN };
}

// Function to dynamically create input fields for points
document.getElementById('numPoints').addEventListener('input', function() {
    const numPoints = this.value;
    const pointsInput = document.getElementById('points-input');
    pointsInput.innerHTML = '';

    for (let i = 0; i < numPoints - 1; i++) {
        pointsInput.innerHTML += `
            <div class="point-section">
                <h3>Point ${i + 1}</h3>
                <label>Angle (Degrees):</label>
                <input type="number" id="angleDeg${i}" required>
                <label>Angle (Minutes):</label>
                <input type="number" id="angleMin${i}" required>
                <label>Angle (Seconds):</label>
                <input type="number" id="angleSec${i}" required>
                <label>Distance (m):</label>
                <input type="number" id="distance${i}" required>
            </div>
        `;
    }
});

// Function to compute traverse
function computeTraverse() {
    const numPoints = document.getElementById('numPoints').value;
    const startAzimuth = parseFloat(document.getElementById('startAzimuth').value);
    const startEasting = parseFloat(document.getElementById('startEasting').value);
    const startNorthing = parseFloat(document.getElementById('startNorthing').value);

    const coordinates = [{ easting: startEasting, northing: startNorthing }];
    const azimuths = [startAzimuth];

    // Traverse data
    const traverseData = [];
    for (let i = 0; i < numPoints - 1; i++) {
        const degrees = parseFloat(document.getElementById(`angleDeg${i}`).value);
        const minutes = parseFloat(document.getElementById(`angleMin${i}`).value);
        const seconds = parseFloat(document.getElementById(`angleSec${i}`).value);
        const angle = dmsToDecimal(degrees, minutes, seconds);

        const distance = parseFloat(document.getElementById(`distance${i}`).value);
        traverseData.push({ angle, distance });
    }

    // Perform traverse calculations
    for (let i = 0; i < traverseData.length; i++) {
        const angle = traverseData[i].angle;
        const distance = traverseData[i].distance;

        // Calculate forward azimuth
        const newAzimuth = calculateAzimuth(azimuths[azimuths.length - 1], angle);
        azimuths.push(newAzimuth);

        // Calculate deltas
        const { deltaE, deltaN } = calculateDeltas(newAzimuth, distance);

        // Calculate new coordinates
        const newEasting = coordinates[coordinates.length - 1].easting + deltaE;
        const newNorthing = coordinates[coordinates.length - 1].northing + deltaN;
        coordinates.push({ easting: newEasting, northing: newNorthing });
    }

    // Display results
    let results = "<h2>Traverse Computation Results:</h2>";
    coordinates.forEach((coord, index) => {
        results += `<p>Point ${index + 1}: Easting = ${coord.easting.toFixed(3)}, Northing = ${coord.northing.toFixed(3)}</p>`;
    });

    document.getElementById('results').innerHTML = results;
}
