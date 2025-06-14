"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Device } from '../types';
import { getDevices, addDevice as addDeviceToSupabase, deleteDevice as deleteDeviceFromSupabase, updateDevice as updateDeviceInSupabase } from '../lib/supabase';
import { Device as SupabaseDevice } from '../types/device';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface DeviceContextType {
  devices: Device[];
  addDevice: (name: string, ip_address: string) => void;
  updateDevice: (id: string, name: string, ip_address: string) => void;
  removeDevice: (id: string) => void;
  isLoading: boolean;
  refreshDevices: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Local storage key for caching
const DEVICES_CACHE_KEY = 'devices_cache';
const CACHE_TIMESTAMP_KEY = 'devices_cache_timestamp';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();

  // Load cached devices
  const loadCachedDevices = useCallback(() => {
    if (!user) return null;
    
    try {
      const cachedTimestampStr = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!cachedTimestampStr) return null;
      
      const cachedTimestamp = parseInt(cachedTimestampStr);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cachedTimestamp < CACHE_EXPIRY_TIME) {
        const cachedDevicesStr = localStorage.getItem(DEVICES_CACHE_KEY);
        if (cachedDevicesStr) {
          return JSON.parse(cachedDevicesStr);
        }
      }
    } catch (error) {
      console.error('Error loading cached devices:', error);
    }
    return null;
  }, [user]);
  
  // Cache devices
  const cacheDevices = useCallback((devicesToCache: Device[]) => {
    if (!user) return;
    
    try {
      localStorage.setItem(DEVICES_CACHE_KEY, JSON.stringify(devicesToCache));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching devices:', error);
    }
  }, [user]);

  // Define refreshDevices before using it in useEffect
  const refreshDevices = useCallback(async () => {
    // Don't try to fetch if no user is authenticated
    if (!user) {
      console.log("Cannot refresh devices: No authenticated user");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Refreshing devices for user:", user.id);
      const { data, error } = await getDevices();
      
      if (error) {
        toast.error('Failed to load devices');
        console.error('Error fetching devices:', error);
      } else {
        console.log("Devices fetched successfully:", data);
        // Convert Supabase device format to the app's device format
        const formattedDevices = (data || []).map((device: SupabaseDevice) => ({
          id: device.id,
          name: device.name,
          ip_address: device.ip_address,
          user_id: device.user_id,
          created_at: device.created_at
        }));
        console.log("Formatted devices:", formattedDevices);
        setDevices(formattedDevices);
        
        // Cache the devices
        cacheDevices(formattedDevices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, [user, cacheDevices]);

  // Fetch devices when user authentication is ready
  useEffect(() => {
    // Only fetch devices if we have a user and auth is done loading
    if (user && !authLoading) {
      console.log("User authenticated, fetching devices...");
      
      // Try to load from cache first
      const cachedDevices = loadCachedDevices();
      if (cachedDevices) {
        console.log("Loaded devices from cache");
        setDevices(cachedDevices);
        setIsLoading(false);
        
        // Refresh in background
        refreshDevices().catch(console.error);
      } else {
        // No cache, do a fresh fetch
        refreshDevices();
      }
    } else if (!authLoading && !user) {
      // If auth is done loading but no user, clear devices
      console.log("No authenticated user, clearing devices");
      setDevices([]);
      setIsLoading(false);
    }
  }, [user, authLoading, loadCachedDevices, refreshDevices]);
  
  // Add tab visibility detection to refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log("Tab became visible, refreshing devices");
        refreshDevices().catch(console.error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshDevices]);

  const addDevice = async (name: string, ip_address: string) => {
    if (!user) {
      toast.error('You must be logged in to add a device');
      return;
    }

    try {
      // Optimistic update for immediate feedback
      const tempId = `temp-${Date.now()}`;
      const newDevice: Device = { 
        id: tempId, 
        name, 
        ip_address,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      setDevices(prev => [...prev, newDevice]);
      
      const { error } = await addDeviceToSupabase(name, ip_address);
      
      if (error) {
        // Revert optimistic update
        setDevices(prev => prev.filter(d => d.id !== tempId));
        toast.error('Failed to add device');
        console.error('Error adding device:', error);
      } else {
        toast.success('Device added successfully');
        // Replace temp device with actual one from server
        await refreshDevices();
      }
    } catch (error) {
      console.error('Error adding device:', error);
      toast.error('Failed to add device');
    }
  };

  const updateDevice = async (id: string, name: string, ip_address: string) => {
    if (!user) {
      toast.error('You must be logged in to update a device');
      return;
    }

    try {
      // Store original device for potential rollback
      const originalDevice = devices.find(d => d.id === id);
      
      // Optimistic update
      setDevices((prev) => 
        prev.map((device) => 
          device.id === id ? { ...device, name, ip_address } : device
        )
      );
      
      // Update the device in Supabase
      const { error } = await updateDeviceInSupabase(id, name, ip_address);
      
      if (error) {
        // Revert optimistic update if there was an error
        if (originalDevice) {
          setDevices(prev => 
            prev.map(d => d.id === id ? originalDevice : d)
          );
        }
        toast.error('Failed to update device');
        console.error('Error updating device:', error);
      } else {
        // Update cache after successful update
        cacheDevices(devices.map(d => d.id === id ? { ...d, name, ip_address } : d));
        toast.success('Device updated successfully');
      }
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error('Failed to update device');
    }
  };

  const removeDevice = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to remove a device');
      return;
    }

    try {
      // Optimistic update - remove device from UI immediately
      const deviceToRemove = devices.find(d => d.id === id);
      setDevices((prev) => prev.filter((device) => device.id !== id));
      
      // Update the cache
      cacheDevices(devices.filter(d => d.id !== id));
      
      const { error } = await deleteDeviceFromSupabase(id);
      if (error) {
        // Revert optimistic update if there was an error
        if (deviceToRemove) {
          setDevices(prev => [...prev, deviceToRemove]);
          // Update cache again
          cacheDevices([...devices.filter(d => d.id !== id), deviceToRemove]);
        }
        toast.error('Failed to delete device');
        console.error('Error deleting device:', error);
      } else {
        toast.success('Device deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Failed to delete device');
    }
  };

  return (
    <DeviceContext.Provider value={{ 
      devices, 
      addDevice, 
      updateDevice, 
      removeDevice,
      isLoading,
      refreshDevices
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceContext() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
} 