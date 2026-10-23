import React from 'react';
import { MapPin } from 'lucide-react';
import { type WeatherInfo } from '../types';

interface WeatherCardProps {
  weatherInfo: WeatherInfo;
  timeString: string;
  onRefresh?: () => void;
  onClick?: () => void;
}

/**
 * Card 1: Weather & Time Card (WeatherTimeCard)
 * Exactly matching Viora Android design tokens:
 * - Container: Full width, background #D3E2FF, border-radius 24px, padding 20px
 * - Top Row: Date string (left) + Location icon & City (right) (rgba(30, 32, 34, 0.6), 14px)
 * - Middle Row (mt-14px): Time string (left, 48px, 600, -1px tracking) + Weather Emoji & Temp (right, 48px, 600)
 * - Bottom Row (mt-14px): Last updated text (left) + UV Index text (right) (rgba(30, 32, 34, 0.6), 14px)
 */
export const WeatherCard: React.FC<WeatherCardProps> = ({
  weatherInfo,
  timeString,
  onClick,
}) => {
  const weatherEmoji = (() => {
    switch (weatherInfo.condition) {
      case 'Sunny':
        return '☀️';
      case 'Cloudy':
        return '☁️';
      case 'Foggy':
        return '🌫️';
      case 'Rainy':
        return '🌧️';
      case 'Snowy':
        return '❄️';
      case 'Thunderstorm':
        return '⛈️';
      default:
        return '☀️';
    }
  })();

  const dateDisplay =
    weatherInfo.dateText ||
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });

  const cityDisplay = weatherInfo.location || 'Tehran';
  const temperatureDisplay = weatherInfo.temperature
    ? (weatherInfo.temperature.includes('°') ? weatherInfo.temperature : `${weatherInfo.temperature}°C`)
    : '21°C';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="w-full bg-[#D3E2FF] text-[#1E2022] rounded-[24px] p-[20px] select-none cursor-pointer transition-all active:scale-[0.99] font-sans shadow-sm"
    >
      {/* Top Row (Flex between, align center) */}
      <div className="flex items-center justify-between text-[14px] leading-tight text-[#1E2022]/60 font-normal">
        <span>{dateDisplay}</span>
        <div className="flex items-center gap-[4px]">
          <MapPin className="w-[16px] h-[16px] text-[#1E2022]/60" />
          <span>{cityDisplay}</span>
        </div>
      </div>

      {/* Middle Row (Flex between, align center, margin-top 14px) */}
      <div className="mt-[14px] flex items-center justify-between">
        <span className="text-[48px] font-[600] text-[#1E2022] leading-none tracking-[-1px]">
          {timeString || '22:13'}
        </span>
        <div className="flex items-center gap-[6px]">
          <span className="text-[30px] leading-none select-none">{weatherEmoji}</span>
          <span className="text-[48px] font-[600] text-[#1E2022] leading-none tracking-tight">
            {temperatureDisplay}
          </span>
        </div>
      </div>

      {/* Bottom Row (Flex between, align center, margin-top 14px) */}
      <div className="mt-[14px] flex items-center justify-between text-[14px] leading-tight text-[#1E2022]/60 font-normal">
        <span>Updated 5m ago</span>
        <span>UV Index : 2</span>
      </div>
    </div>
  );
};
