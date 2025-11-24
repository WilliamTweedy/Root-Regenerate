import { WeatherData } from "../types";

export const getWeather = async (): Promise<WeatherData> => {
  // In a real app, we would use navigator.geolocation to get coords
  // and call OpenWeatherMap API.
  
  // For this prototype, we simulate a response or try a basic fetch if we had a key.
  // Simulating "London" weather for demonstration logic.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      const month = now.getMonth(); // 0-11
      
      // Simulate colder temps in winter months (Nov-Feb)
      const isWinter = month >= 10 || month <= 1;
      const temp = isWinter ? 1 : 18; 
      
      resolve({
        temp: temp,
        condition: isWinter ? 'Cloudy' : 'Sunny',
        icon: isWinter ? 'cloud' : 'sun',
        isFrostWarning: temp < 2
      });
    }, 800);
  });
};