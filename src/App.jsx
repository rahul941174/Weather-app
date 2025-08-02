import React, { useEffect, useState } from 'react';
import "./App.css"

const API_KEY = "6c8ffa79942e5a815734daea1a7334e0";

const App = () => {

    const [currentTab, setCurrentTab] = useState("userWeather");
    const [coordinates, setCoordinates] = useState(null);
    const [city, setCity] = useState("");
    const [weatherInfo, setWeatherInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [forecastData, setForecastData] = useState([]);

    const [background, setBackground] = useState("/default.jpg");  // New state for background

    useEffect(() => {
        const savedCoordinates = sessionStorage.getItem("userCoordinates");
        if (savedCoordinates) {
            setCoordinates(JSON.parse(savedCoordinates));
        }
    }, []);

    useEffect(() => {
        if (coordinates) {
            fetchWeatherByCoordinates(coordinates);
            fetchForecastByCoordinates(coordinates); 
        }
    }, [coordinates]);

    useEffect(() => {
        if (weatherInfo) {
            updateBackground(weatherInfo.weather[0].main);
        }
    }, [weatherInfo]);

    const grantLocationAccess = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userCoordinates = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    sessionStorage.setItem(
                        "userCoordinates",
                        JSON.stringify(userCoordinates),
                    );
                    setCoordinates(userCoordinates);
                },
                () => {
                    setError("Unable to get location. Please grant permission.");
                }
            );
        } else {
            setError("GeoLocation is not supported in your browser.");
        }
    };

    const fetchWeatherByCoordinates = async ({ lat, lon }) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
            const data = await res.json();
            if (data?.cod === 200) {
                setWeatherInfo(data);
            } else {
                setError(data.message || "Failed to fetch weather data");
            }
        } catch (err) {
            setError("Error in fetching weather data");
        } finally {
            setLoading(false);
        }
    };


    const fetchForecastByCoordinates = async ({ lat, lon }) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
            const data = await res.json();
            if (data?.cod === "200") {
                setForecastData(data.list); // Set forecast data
            } else {
                setError(data.message || "Failed to fetch forecast data");
            }
        } catch (err) {
            setError("Error in fetching forecast data");
        } finally {
            setLoading(false);
        }
    };

    const fetchWeatherByCity = async () => {
        if (!city) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
            const data = await res.json();
            if (data?.cod === 200) {
                setWeatherInfo(data);
            } else {
                setError(data.message || "Failed to fetch weather data");
            }
        } catch (err) {
            setError("Error in fetching weather data");
        } finally {
            setLoading(false);
        }
    };

    const fetchForecastByCity = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
            const data = await res.json();
            if (data?.cod === "200") {
                setForecastData(data.list); // Set forecast data
            } else {
                setError(data.message || "Failed to fetch forecast data");
            }
        } catch (err) {
            setError("Error in fetching forecast data");
        } finally {
            setLoading(false);
        }
    };

    const updateBackground = (weather) => {
        let newBackground = "";
        switch (weather) {
            case "Clear":
                newBackground = "/clear_sky.jpg"; // Replace with your image path
                break;
            case "Clouds":
                newBackground = "/clouds.jpg";
                break;
            case "Rain":
                newBackground = "/rainyy.jpg";
                break;
            case "Snow":
                newBackground = "/snow.jpg";
                break;
            case "Thunderstorm":
                newBackground = "/thunder.jpg";
                break;
            case "Haze":
                newBackground = "/haze.jpg";
                break;
            case "Mist":
                newBackground = "/Mist.jpg";
                break;
            default:
                newBackground = "/default.jpg";
                break;
        }
        console.log("weather ",weather)
        setBackground(newBackground);
    };
    

    const renderWeatherDetails = () => {
        if (!weatherInfo) return null;

        const { name, sys, weather, main, wind, clouds } = weatherInfo;
        const temperature = (main?.temp - 273.15).toFixed(1); // Kelvin to Celsius
        const feelsLike = (main?.feels_like - 273.15).toFixed(1);

        return (
            <div className='w-9/12 mx-auto flex flex-col items-center'>
                <div className='flex gap-2'>
                    <p className='font-bold text-2xl'>{name}</p>
                    <img src={`https://flagcdn.com/144x108/${sys.country.toLowerCase()}.png`}
                        className='w-8 h-8'
                        alt='country-flag'
                    />
                </div>
                <p className='uppercase text-lg mt-2 font-medium'>{weather?.[0]?.description || "No description available"}</p>
                {weather?.[0]?.icon && (
                    <img
                        src={`https://openweathermap.org/img/w/${weather[0].icon}.png`}
                        alt="Weather Icon"
                        className="w-16 h-16"
                    />
                )}

                <p className='text-xl font-semibold mb-1'>{`Temperature : ${temperature} °C`}</p>
                <p className='text-xl font-semibold mb-4'>{`Feels Like : ${feelsLike} °C`}</p>

                <div className='flex gap-x-3 mt-5'>
                    <div className='w-[140px] flex flex-col bg-black p-3 gap-2 items-center rounded-md'>
                        <img src={'/wind.png'} alt='wind' className="w-10 h-10" />
                        <p className="uppercase text-lg font-medium">Wind Speed</p>
                        <p className="text-xl font-semibold">{wind?.speed || "N/A"} m/s</p>
                    </div>
                    <div className='w-[140px] flex flex-col bg-black p-3 gap-2 items-center rounded-md'>
                        <img src='/humidity.png' alt='humidity' className="w-10 h-10" />
                        <p className="uppercase text-lg font-medium">Humidity</p>
                        <p className="text-xl font-semibold">{main?.humidity || "N/A"} %</p>
                    </div>
                    <div className='w-[140px] flex flex-col bg-black p-3 gap-2 items-center rounded-md'>
                        <img src='/cloud.png' alt='clouds' className="w-10 h-10" />
                        <p className="uppercase text-lg font-medium">Clouds</p>
                        <p className="text-xl font-semibold">{clouds?.all || 0} %</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderForecastDetails = () => {
        if (!forecastData) return null;
    
        return (
            <div className=" mt-6 flex flex-col items-center mx-4">
                <div className='flex gap-x-2 items-center'>
                    <h2 className="text-2xl font-bold text-center mb-4">5-Day Forecast</h2>
                    <img src='/forecast.png' alt='forecast' className="w-10 h-10"  />
                </div>
                <div className=" w-full flex gap-4 overflow-x-auto scrollbar-hide">
                    {forecastData.map((item, index) => (
                        <div 
                            key={index} 
                            className=" w-[350px] px-4 py-6 gap-2  flex flex-col items-center bg-black bg-opacity-50 rounded-md flex-shrink-0"
                        >
                            <p className="text-lg font-semibold">{item.dt_txt}</p>
                            <p className="text-md font-medium">{`Temperature: ${item.main.temp} °C`}</p>
                            <div className='flex gap-x-2 items-center'>
                                <p className="text-md font-medium uppercase">{` ${item.weather[0].description}`}</p>
                                {item.weather?.[0]?.icon && (
                                    <img
                                        src={`https://openweathermap.org/img/w/${item.weather[0].icon}.png`}
                                        alt="Weather Icon"
                                        className="w-16 h-16"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    


    return (
        <div className="w-full min-h-screen bg-cover bg-center text-[#F9F7F7] " 
            style={{ backgroundImage: `url(${background})` }}
        >
            <h1 className="text-3xl font-bold text-white text-center mb-5 pt-10 px-3">WEATHER APP</h1>
            <div className='bg-black bg-opacity-70  w-8/12 h-fit mx-auto pb-4 pt-2 rounded-lg '>
                <div className="flex justify-between max-w-2xl mx-auto mt-5 ">
                    <p
                        className={`cursor-pointer text-xl font-semibold tracking-wider py-1 px-2 hover:scale-[110%]  ${
                            currentTab === "userWeather" ? "bg-opacity-50 bg-black rounded-md" : ""
                        }`}
                        onClick={() => {
                            setCurrentTab("userWeather")
                            setWeatherInfo(null);
                            setForecastData(null);
                            fetchWeatherByCoordinates(coordinates);
                            fetchForecastByCoordinates(coordinates);
                        }}
                    >
                        My Weather
                    </p>
                    <p
                        className={`cursor-pointer text-xl font-semibold tracking-wider py-1 px-2 hover:scale-[110%]  ${
                            currentTab === "searchWeather" ? "bg-opacity-50 bg-black rounded-md" : ""
                        }`}
                        onClick={() => {
                            setWeatherInfo(null);
                            setForecastData(null);
                            setCurrentTab("searchWeather")
                        }}
                    >
                        Search Weather
                    </p>
                </div>
                <div className="mt-8">
                    {currentTab === "userWeather" && !coordinates && (
                        <div className="flex flex-col items-center gap-8">
                            <img src="location.png" alt="Location Icon" className="w-20 h-20" />
                            <p className="text-2xl font-semibold">Grant Location Access</p>
                            <p className="text-lg font-medium">
                                Allow access to get weather information
                            </p>
                            <button
                                className="bg-[#3F72AF] text-white font-semibold py-2 px-8 rounded-md"
                                onClick={grantLocationAccess}
                            >
                                Grant Access
                            </button>
                        </div>
                    )}
                    {currentTab === "searchWeather" && (
                        <form
                            className="flex w-11/12 max-w-2xl mx-auto gap-2 mb-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                fetchWeatherByCity();
                                fetchForecastByCity();
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Search for city.."
                                className="w-full h-10 px-5 rounded-xl bg-opacity-50 bg-black text-white placeholder:text-white"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                            <button type="submit" className="w-10 h-10 flex items-center justify-center rounded-full hover:scale-[110%] bg-[#8ea8d4]">
                                <img src="search.png" alt="Search Icon" className="w-5 h-5  " />
                            </button>
                        </form>
                    )}
                    {loading && (
                        <div className="flex flex-col items-center gap-8">
                            <img src="loading.gif" alt="Loading" className="w-32 h-32" />
                            <p className="uppercase text-2xl font-semibold">Loading</p>
                        </div>
                    )}
                    {!loading && error && <p className="text-red-500 text-3xl font-bold text-center">{error}</p>}
                    {!loading && !error && renderWeatherDetails()}
                    {!loading && !error && renderForecastDetails()}
                </div>
            </div>
        </div>
    );
};

export default App;
