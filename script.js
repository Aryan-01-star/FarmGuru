const WEATHER_API_KEY = '3c62d9d1ccd24beb815204547241811'; // Replace with your Weather API Key
const GPT_API_KEY = 'your-gpt-api-key'; // Replace with your GPT API Key

// Local dataset for crops based on seasons and temperature
const cropData = {
    summer: [
        { temperatureRange: { minTemp: 18, maxTemp: 35 }, crops: ['Corn', 'Tomatoes', 'Peppers', 'Basil', 'Sunflowers', 'Zucchini', 'Green Beans'] },
        { temperatureRange: { minTemp: 18, maxTemp: 30 }, crops: ['Soybeans', 'Cucumbers', 'Chili', 'Lettuce', 'Melons', 'Squash'] },
        { temperatureRange: { minTemp: 20, maxTemp: 40 }, crops: ['Watermelon', 'Rice', 'Okra', 'Peaches', 'Pineapple'] },
        { temperatureRange: { minTemp: 20, maxTemp: 35 }, crops: ['Okra', 'Eggplant', 'Sweet Potatoes', 'Pumpkins', 'Peppers', 'Tomatoes'] },
        { temperatureRange: { minTemp: 22, maxTemp: 37 }, crops: ['Melons', 'Papaya', 'Cantaloupe', 'Pumpkins'] },
    ],
    spring: [
        { temperatureRange: { minTemp: 8, maxTemp: 20 }, crops: ['Peas', 'Spinach', 'Radishes', 'Garlic', 'Chard', 'Lettuce'] },
        { temperatureRange: { minTemp: 8, maxTemp: 22 }, crops: ['Carrots', 'Celery', 'Kale', 'Beets', 'Turnips'] },
        { temperatureRange: { minTemp: 10, maxTemp: 24 }, crops: ['Wheat', 'Cabbage', 'Potatoes', 'Onions', 'Cauliflower'] },
        { temperatureRange: { minTemp: 10, maxTemp: 25 }, crops: ['Barley', 'Cauliflower', 'Leeks', 'Radicchio'] },
        { temperatureRange: { minTemp: 10, maxTemp: 22 }, crops: ['Lettuce', 'Chives', 'Mustard Greens'] },
        { temperatureRange: { minTemp: 12, maxTemp: 25 }, crops: ['Onions', 'Strawberries', 'Asparagus', 'Rhubarb'] },
        { temperatureRange: { minTemp: 8, maxTemp: 24 }, crops: ['Asparagus', 'Peas', 'Fennel'] },
    ],
    autumn: [
        { temperatureRange: { minTemp: 5, maxTemp: 20 }, crops: ['Carrots', 'Winter Squash', 'Radishes', 'Sweet Potatoes', 'Leeks'] },
        { temperatureRange: { minTemp: 5, maxTemp: 18 }, crops: ['Broccoli', 'Turnips', 'Beets', 'Kale', 'Brussels Sprouts'] },
        { temperatureRange: { minTemp: 5, maxTemp: 15 }, crops: ['Brussels Sprouts', 'Rutabaga', 'Leeks', 'Chard'] },
        { temperatureRange: { minTemp: 5, maxTemp: 18 }, crops: ['Parsnips', 'Chard', 'Collard Greens', 'Endive'] },
        { temperatureRange: { minTemp: 8, maxTemp: 22 }, crops: ['Radishes', 'Collards', 'Mustard Greens', 'Chives'] },
        { temperatureRange: { minTemp: 8, maxTemp: 20 }, crops: ['Endive', 'Fennel', 'Arugula', 'Mache'] },
    ],
    winter: [
        { temperatureRange: { minTemp: -5, maxTemp: 10 }, crops: ['Garlic', 'Parsley', 'Shallots', 'Chives'] },
        { temperatureRange: { minTemp: -5, maxTemp: 5 }, crops: ['Kale', 'Mache', 'Brussels Sprouts', 'Savoy Cabbage', 'Winter Onions'] },
        { temperatureRange: { minTemp: 0, maxTemp: 12 }, crops: ['Spinach', 'Cilantro', 'Arugula', 'Mustard Greens', 'Endive'] },
        { temperatureRange: { minTemp: 0, maxTemp: 10 }, crops: ['Lettuce', 'Endive', 'Radicchio'] },
        { temperatureRange: { minTemp: -2, maxTemp: 10 }, crops: ['Savoy Cabbage', 'Turnips', 'Horseradish'] },
        { temperatureRange: { minTemp: -5, maxTemp: 8 }, crops: ['Mustard Greens', 'Horseradish', 'Leeks'] },
        { temperatureRange: { minTemp: -3, maxTemp: 8 }, crops: ['Chives', 'Winter Onions', 'Garlic'] },
    ]
};

// Initialize the app on page load
document.addEventListener('DOMContentLoaded', () => {
    const recommendationButton = document.querySelector('.cta-button');
    recommendationButton.addEventListener('click', () => getCurrentLocation(getCropRecommendation));
});

// Function to get the user's current location
function getCurrentLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                callback(latitude, longitude);
            },
            error => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Please enable location services.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to fetch weather data and recommend crops
function getCropRecommendation(lat, lon) {
    const WEATHER_API_URL = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`;

    fetch(WEATHER_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather API Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const { temp_c } = data.current;
            const season = determineSeason(temp_c);

            console.log(`Location: (${lat}, ${lon})`);
            console.log(`Temperature: ${temp_c}°C, Season: ${season}`);

            const recommendedCrop = recommendCrop(temp_c, season);
            displayRecommendation(recommendedCrop);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Unable to fetch weather data. Please try again later.");
        });
}

// Function to determine the season based on the month
function determineSeason(temp) {
    const month = new Date().getMonth(); // 0 = January, 11 = December
    if (month >= 5 && month <= 8) return 'summer'; // June to August
    if (month >= 2 && month <= 4) return 'spring'; // March to May
    if (month >= 9 && month <= 11) return 'autumn'; // September to November
    return 'winter'; // December to February
}

// Function to recommend a crop based on temperature and season
function recommendCrop(temp, season) {
    const crops = cropData[season];
    if (!crops) {
        return "No crop data available for this season.";
    }

    // Find crops that match the temperature range
    const suitableCrops = crops.filter(
        crop => temp >= crop.temperatureRange.minTemp && temp <= crop.temperatureRange.maxTemp
    );

    if (suitableCrops.length === 0) {
        return `No suitable crops found for the current conditions (${temp}°C, season: ${season}).`;
    }

    // Flatten the crop list and remove duplicates
    const cropList = [...new Set(suitableCrops.flatMap(crop => crop.crops))];
    return cropList.join(', ');
}

// Function to display the crop recommendation in the UI
function displayRecommendation(recommendation) {
    const cropResult = document.getElementById('crop-result');
    cropResult.innerHTML = `<h3>Recommended Crops: ${recommendation}</h3>`;
}


// Function to request location permission and fetch data
function requestLocationPermission() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Fetch weather and display it
                getWeather(lat, lon);

                // Fetch nearby shops and sellers
                getNearbyPlaces(lat, lon, 'organic+store', 'sellers-result', 'Organic Product Sellers');
                getNearbyPlaces(lat, lon, 'farm+equipment+store', 'shops-result', 'Crop Shops');
            },
            showError,
            { enableHighAccuracy: true }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Fetch weather data from WeatherAPI
function getWeather(lat, lon) {
    const WEATHER_API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const locationName = document.getElementById('location-name');
            const date = document.getElementById('date');
            const time = document.getElementById('time');
            const temperature = document.getElementById('temperature');
            const weatherIcon = document.getElementById('weather-icon');
            const temperatureRange = document.getElementById('temperature-range');
            const windSpeed = document.getElementById('wind-speed');
            const rainChance = document.getElementById('rain-chance');
            const hourlyForecast = document.getElementById('hourly-forecast');
            const weatherCard = document.getElementById('weather-card');

            // Populate main weather data
            const { temp_c, condition, wind_kph, humidity } = data.current;
            const { maxtemp_c, mintemp_c } = data.forecast.forecastday[0].day;
            const { hour } = data.forecast.forecastday[0];

            locationName.textContent = data.location.name;
            date.textContent = new Date(data.location.localtime).toDateString();
            time.textContent = `Last updated: ${new Date(data.location.localtime).toLocaleTimeString()}`;
            temperature.textContent = `${temp_c}°C`;
            temperatureRange.textContent = `${mintemp_c}°C - ${maxtemp_c}°C`;
            windSpeed.textContent = `${wind_kph} km/h`;
            rainChance.textContent = `${humidity}%`;
            weatherIcon.src = `https:${condition.icon}`;
            weatherIcon.alt = condition.text;

            // Populate hourly forecast dynamically
            const currentHour = new Date(data.location.localtime).getHours();
            const remainingHours = hour.filter(hourData => {
                const forecastHour = new Date(hourData.time).getHours();
                return forecastHour >= currentHour; // Only include upcoming hours
            });

            hourlyForecast.innerHTML = remainingHours.slice(0, 6).map(hourData => {
                const forecastTime = new Date(hourData.time).getHours();
                const displayTime = forecastTime > 12 
                    ? `${forecastTime - 12}:00 PM` 
                    : `${forecastTime}:00 AM`; // Convert to 12-hour AM/PM format

                return `
                    <div>
                        <p>${displayTime}</p>
                        <img src="https:${hourData.condition.icon}" alt="${hourData.condition.text}">
                        <p>${hourData.temp_c}°C</p>
                    </div>
                `;
            }).join('');

            // Update background based on weather and time
            updateBackground(data.location.localtime, condition.text);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Unable to retrieve weather data. Please try again later.');
        });
}

// Dynamically update the background based on the time and weather condition
function updateBackground(localtime, condition) {
    const weatherCard = document.getElementById('weather-card');
    const currentHour = new Date(localtime).getHours();
    let backgroundGradient;

    // Determine time-based gradients
    if (currentHour >= 5 && currentHour < 10) { // Morning
        backgroundGradient = 'linear-gradient(135deg, #ffedbc, #ff7e5f)';
    } else if (currentHour >= 10 && currentHour < 17) { // Day
        backgroundGradient = 'linear-gradient(135deg, #87ceeb, #f9d423)';
    } else if (currentHour >= 17 && currentHour < 20) { // Evening
        backgroundGradient = 'linear-gradient(135deg, #ff9966, #ff5e62)';
    } else { // Night
        backgroundGradient = 'linear-gradient(135deg, #1e1e2f, #607d8b)';
    }

    // Overlay weather condition
    if (condition.toLowerCase().includes('rain')) {
        backgroundGradient = 'linear-gradient(135deg, #5a647d, #8395a7)';
    } else if (condition.toLowerCase().includes('clear')) {
        backgroundGradient = 'linear-gradient(135deg, #87ceeb, #f9d423)';
    } else if (condition.toLowerCase().includes('cloud')) {
        backgroundGradient = 'linear-gradient(135deg, #bdc3c7, #2c3e50)';
    } else if (condition.toLowerCase().includes('snow')) {
        backgroundGradient = 'linear-gradient(135deg, #e6f7ff, #c9e7ff)';
    }

    weatherCard.style.transition = 'background 1s ease';
    weatherCard.style.background = backgroundGradient;
}

// Get current location and fetch weather data
function getWeatherForCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeather(latitude, longitude);
            },
            error => {
                console.error('Error retrieving location:', error);
                alert('Unable to retrieve your location. Please allow location access or enter your city manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', getWeatherForCurrentLocation);

// Initialize app and set up auto-refresh
document.addEventListener('DOMContentLoaded', () => {
    // Automatically request location and fetch weather data when the page loads
    requestLocationPermission();

    // Set interval to auto-refresh every 5 minutes (300,000 milliseconds)
    setInterval(() => {
        console.log("Refreshing weather data...");
        requestLocationPermission();
    }, 300000); // 300,000 ms = 5 minutes
});


function initCarousel() {
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    let currentSlide = 0;
    const totalSlides = items.length;

    // Helper function to update the carousel
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Event listeners for navigation buttons
    prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    });

    nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    });

    // Automatic sliding
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }, 5000);

    // Initialize the carousel
    updateCarousel();
}

// Initialize carousel after DOM content loads
document.addEventListener('DOMContentLoaded', initCarousel);


// Dark Theme Toggle
function toggleTheme() {
    const theme = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", theme === "dark" ? "light" : "dark");
}

// Side Drawer Toggle
function toggleDrawer() {
    const drawer = document.getElementById("side-drawer");
    drawer.classList.toggle("open");
}

function closeDrawer() {
    const drawer = document.getElementById("side-drawer");
    drawer.classList.remove("open");
}

// Dark and Light Mode Toggle with Local Storage
const body = document.querySelector("body"),
    nav = document.querySelector("nav"),
    modeToggle = document.querySelector(".dark-light"),
    searchToggle = document.querySelector(".searchToggle"),
    sidebarOpen = document.querySelector(".sidebarOpen"),
    sidebarClose = document.querySelector(".siderbarClose");

let getMode = localStorage.getItem("mode");
if (getMode && getMode === "dark-mode") {
    body.classList.add("dark");
}

// Set the default theme to dark mode if not set
window.addEventListener("DOMContentLoaded", () => {
    const storedMode = localStorage.getItem("mode");
    if (storedMode === "dark-mode") {
        body.classList.add("dark");
        modeToggle.classList.add("active");
    } else {
        body.classList.remove("dark");
        modeToggle.classList.remove("active");
    }
});

// Toggle dark and light mode
modeToggle.addEventListener("click", () => {
    modeToggle.classList.toggle("active");
    body.classList.toggle("dark");

    // Save user preference
    if (!body.classList.contains("dark")) {
        localStorage.setItem("mode", "light-mode");
    } else {
        localStorage.setItem("mode", "dark-mode");
    }
});

// Toggle search box
searchToggle.addEventListener("click", () => {
    searchToggle.classList.toggle("active");
});

// Toggle sidebar
sidebarOpen.addEventListener("click", () => {
    nav.classList.add("active");
});

body.addEventListener("click", e => {
    let clickedElm = e.target;

    if (!clickedElm.classList.contains("sidebarOpen") && !clickedElm.classList.contains("menu")) {
        nav.classList.remove("active");
    }
});

// Mock data for sellers and buyers with their locations
const locations = [
    { name: "Organic Farm Fresh", type: "Seller", lat: 37.7749, lng: -122.4194 },
    { name: "Green Veggies Market", type: "Seller", lat: 34.0522, lng: -118.2437 },
    { name: "Natural Buyers Co.", type: "Buyer", lat: 40.7128, lng: -74.006 },
    { name: "Farm Direct Buyer", type: "Buyer", lat: 41.8781, lng: -87.6298 },
];

// Initialize the map and markers
let map;
let markersLayer;

// Function to initialize the map
function initializeMap(lat, lng) {
    if (!map) {
        map = L.map("map").setView([lat, lng], 10);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map); // Layer to hold the markers
    } else {
        map.setView([lat, lng], 10); // Update the map's view
        markersLayer.clearLayers(); // Clear existing markers
    }

    // Add a marker for the user's location
    L.marker([lat, lng], { icon: L.icon({ 
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png", 
        iconSize: [25, 41], 
        iconAnchor: [12, 41] 
    }) })
    .addTo(map)
    .bindPopup("<strong>Your Location</strong>")
    .openPopup();
}

// Function to add markers for sellers/buyers
function addMarkersToMap(nearbyLocations) {
    nearbyLocations.forEach((location) => {
        const marker = L.marker([location.lat, location.lng]).addTo(markersLayer);
        marker.bindPopup(`
            <strong>${location.name}</strong><br>
            Type: ${location.type}<br>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}" target="_blank">
                Get Directions
            </a>
        `);
    });
}

// Function to fetch nearby sellers/buyers based on user's current location
function getNearbySellers() {
    const resultDiv = document.getElementById("sellers-result");
    resultDiv.innerHTML = "Fetching your location...";

    // Use Geolocation API to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Initialize the map with user's location
                initializeMap(userLat, userLng);

                // Filter locations within 50km range
                const nearbyLocations = locations.filter((location) => {
                    const distance = getDistance(userLat, userLng, location.lat, location.lng);
                    return distance <= 50; // Adjust range as needed
                });

                // Display the results dynamically
                if (nearbyLocations.length > 0) {
                    resultDiv.innerHTML = nearbyLocations
                        .map(
                            (location) => `
                            <div class="result-item">
                                <strong>${location.name}</strong> (${location.type})<br>
                                <em>Distance: ${getDistance(userLat, userLng, location.lat, location.lng).toFixed(2)} km</em>
                            </div>
                        `
                        )
                        .join("");

                    // Add the nearby locations to the map
                    addMarkersToMap(nearbyLocations);
                } else {
                    resultDiv.innerHTML = "No nearby sellers/buyers found within 50 km.";
                }
            },
            (error) => {
                resultDiv.innerHTML = "Unable to retrieve location. Please try again.";
                console.error(error);
            }
        );
    } else {
        resultDiv.innerHTML = "Geolocation is not supported by your browser.";
    }
}

// Function to calculate distance between two coordinates
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
// Elements
const chatbotIcon = document.getElementById('chatbot-icon');
const chatbotBox = document.getElementById('chatbot-box');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotOverlay = document.createElement('div');

// Create and add overlay to the document
chatbotOverlay.id = 'chatbot-overlay';
document.body.appendChild(chatbotOverlay);

// Function to toggle chatbot visibility
function toggleChatbot() {
    const isVisible = chatbotBox.classList.contains('visible');
    chatbotBox.classList.toggle('visible', !isVisible);
    chatbotOverlay.classList.toggle('visible', !isVisible);
}

// Event Listeners
chatbotIcon.addEventListener('click', toggleChatbot);
chatbotClose.addEventListener('click', toggleChatbot);

// Collapse chatbot when clicking outside
chatbotOverlay.addEventListener('click', toggleChatbot);

// Handle form submission
document.getElementById('ai-question-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const answerBox = document.getElementById('ai-answer');
    const questionInput = document.getElementById('ai-question-input').value;

    // Example AI response
    answerBox.textContent = `You asked: "${questionInput}". Here's the AI's response!`;
});
