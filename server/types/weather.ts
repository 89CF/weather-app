export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_mph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      msgtype: string;
      severity: string;
      urgency: string;
      areas: string;
      category: string;
      certainty: string;
      event: string;
      note: string;
      effective: string;
      expires: string;
      desc: string;
      instruction: string;
    }>;
  };
}

export interface WeatherForecast {
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        maxwind_kph: number;
        maxwind_mph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        avghumidity: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
      };
    }>;
  };
} 