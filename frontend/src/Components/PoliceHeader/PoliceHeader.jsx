import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import logo from "../../assets/PLogo.png";

export default function PoliceHeader() {
  const [currentLocation, setCurrentLocation] = useState("");
  const now = new Date();
  const date = now.toLocaleDateString("en-US");
  const time = now.toLocaleTimeString("en-US");

  // Get real-time location
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get address
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`)
              .then(response => response.json())
              .then(data => {
                if (data.display_name) {
                  const address = data.display_name.split(',').slice(0, 3).join(',');
                  setCurrentLocation(address);
                  // Store in localStorage for other components
                  localStorage.setItem('userLocation', address);
                  sessionStorage.setItem('userLocation', address);
                }
              })
              .catch(() => {
                // Fallback to coordinates if geocoding fails
                const locationText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                setCurrentLocation(locationText);
                localStorage.setItem('userLocation', locationText);
                sessionStorage.setItem('userLocation', locationText);
              });
          },
          (error) => {
            console.log('Location access denied or error:', error.message);
            // Use stored location or default
            const storedLocation = localStorage.getItem('userLocation') || sessionStorage.getItem('userLocation') || 'Millaniya, Horana Town';
            setCurrentLocation(storedLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        // Fallback for browsers that don't support geolocation
        const storedLocation = localStorage.getItem('userLocation') || sessionStorage.getItem('userLocation') || 'Millaniya, Horana Town';
        setCurrentLocation(storedLocation);
      }
    };

    getUserLocation();
  }, []);

  return (
    <div className="bg-white-600 p-2">
      <div className="mx-auto flex max-w-10xl items-center justify-between rounded-full bg-[#19314d] px-4 py-4 shadow-md lg:px-20">
        {/* Left logo + title */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Police Badge" className="h-16 w-20" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white text-[16px]">
              Police360, Sri Lanka.
            </span>
            <span className="text-xs text-gray-300 text-[13px]">
              Police Database Terminal
            </span>
          </div>
        </div>

        {/* Center date/time */}
        <div className="rounded-md bg-[#264566] px-4 py-1 text-center text-[15px] text-white">
          <div>{date}</div>
          <div>{time}</div>
        </div>

        {/* Right officer info */}
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-white text-[16px]">
            Welcome, {localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Officer'}
          </span>
          <div className="flex items-center gap-1 text-[13px] text-gray-300">
            <MapPin size={12} />
            <span>{currentLocation || 'Detecting location...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
