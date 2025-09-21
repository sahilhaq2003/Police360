import React, { useState, useEffect } from "react";
import { MapPin, LogOut, Shield, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/PLogo.png";

export default function AdminHeader() {
  const [currentLocation, setCurrentLocation] = useState("");
  const navigate = useNavigate();
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

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="bg-white-600 p-2">
      <div className="mx-auto grid grid-cols-3 max-w-10xl items-center bg-white/80 py-2 shadow-md px-4 lg:px-20">
        {/* Left logo + title */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Police Badge" className="h-16 w-16 rounded-full bg-[#0B214A]" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[#0B214A] text-[16px]">
              Police360, Sri Lanka.
            </span>
            <span className="text-xs text-[#5A6B85]-100 text-[13px]">
              Chief Control Panel
            </span>
          </div>
        </div>

        {/* Center date/time */}
        <div className="rounded-md px-4 py-1 text-center text-[14px] text-[#0B214A] justify-self-center">
          <div>{date}</div>
          <div>{time}</div>
        </div>

        {/* Right admin info + logout */}
        <div className="flex items-center gap-3 justify-self-end">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0B214A]" />
            <Settings className="w-4 h-4 text-[#5A6B85]" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[#0B214A] text-[16px]">
              Welcome Chief, {localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Admin Name'}
            </span>
            <div className="flex items-center gap-1 text-[13px] text-[#5A6B85]-100">
              <MapPin size={12} />
              <span>{currentLocation || 'Detecting location...'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#0B214A] text-white hover:opacity-95"
          >
            <LogOut className="w-5 h-7" /> 
          </button>
        </div>
      </div>
    </div>
  );
}
