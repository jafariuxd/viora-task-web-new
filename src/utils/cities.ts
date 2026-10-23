export interface CityPreset {
  name: string;
  latitude: number;
  longitude: number;
}

export const presetCities: CityPreset[] = [
  { name: 'Tehran', latitude: 35.6944, longitude: 51.4215 },
  { name: 'Mashhad', latitude: 36.297, longitude: 59.6062 },
  { name: 'Isfahan', latitude: 32.6546, longitude: 51.668 },
  { name: 'Shiraz', latitude: 29.5918, longitude: 52.5837 },
  { name: 'Tabriz', latitude: 38.0962, longitude: 46.2738 },
  { name: 'Karaj', latitude: 35.8327, longitude: 50.9915 },
  { name: 'Ahvaz', latitude: 31.3183, longitude: 48.6706 },
  { name: 'Yazd', latitude: 31.8974, longitude: 54.3569 },
  { name: 'Rasht', latitude: 37.2808, longitude: 49.5831 },
  { name: 'Kerman', latitude: 30.2839, longitude: 57.0834 },
  { name: 'Qom', latitude: 34.6416, longitude: 50.8746 },
  { name: 'Sanandaj', latitude: 35.3113, longitude: 46.9961 },
  { name: 'Zahedan', latitude: 29.4963, longitude: 60.8629 },
  { name: 'Sari', latitude: 36.5659, longitude: 53.0581 },
];
