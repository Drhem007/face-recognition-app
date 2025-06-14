'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AttendanceReport, AttendanceReportDB } from '../types';
import { getAttendanceReports, addAttendanceReport, deleteAttendanceReport } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface AttendanceContextType {
  reports: AttendanceReport[];
  isLoading: boolean;
  addReport: (
    deviceId: string,
    totalStudents: number,
    presentStudents: number,
    absentStudents: number,
    attendanceRate: number,
    fileName: string,
    examDate: string,
    examTime: string
  ) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendanceContext = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendanceContext must be used within an AttendanceProvider');
  }
  return context;
};

// Helper function to transform database data to frontend format
const transformReportData = (dbReport: AttendanceReportDB): AttendanceReport => {
  return {
    id: dbReport.id,
    deviceId: dbReport.device_id,
    deviceName: dbReport.devices.name,
    date: dbReport.exam_date,
    time: dbReport.exam_time,
    totalStudents: dbReport.total_students,
    presentStudents: dbReport.present_students,
    absentStudents: dbReport.absent_students,
    attendanceRate: dbReport.attendance_rate,
    fileName: dbReport.file_name
  };
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const fetchReports = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setReports([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await getAttendanceReports();
      
      if (error) {
        console.error('Error fetching attendance reports:', error);
        // Only show toast error if it's not an authentication error
        if (!error.message.includes('not authenticated')) {
          toast.error('Failed to load attendance reports');
        }
        setReports([]);
        return;
      }
      
      if (data) {
        const transformedReports = data.map(transformReportData);
        setReports(transformedReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Unexpected error fetching attendance reports:', error);
      // Only show toast error if user is authenticated
      if (user) {
        toast.error('Failed to load attendance reports');
      }
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addReport = async (
    deviceId: string,
    totalStudents: number,
    presentStudents: number,
    absentStudents: number,
    attendanceRate: number,
    fileName: string,
    examDate: string,
    examTime: string
  ) => {
    if (!user) {
      toast.error('Please sign in to add attendance reports');
      return;
    }

    try {
      const { data, error } = await addAttendanceReport(
        deviceId,
        totalStudents,
        presentStudents,
        absentStudents,
        attendanceRate,
        fileName,
        examDate,
        examTime
      );
      
      if (error) {
        console.error('Error adding attendance report:', error);
        toast.error('Failed to add attendance report');
        return;
      }
      
      if (data && data[0]) {
        // Refresh reports to get the latest data with device info
        await fetchReports();
        toast.success('Attendance report added successfully');
      }
    } catch (error) {
      console.error('Unexpected error adding attendance report:', error);
      toast.error('Failed to add attendance report');
    }
  };

  const deleteReport = async (id: string) => {
    if (!user) {
      toast.error('Please sign in to delete attendance reports');
      return;
    }

    try {
      const { error } = await deleteAttendanceReport(id);
      
      if (error) {
        console.error('Error deleting attendance report:', error);
        toast.error('Failed to delete attendance report');
        return;
      }
      
      // Remove the report from local state
      setReports(prev => prev.filter(report => report.id !== id));
      toast.success('Attendance report deleted successfully');
    } catch (error) {
      console.error('Unexpected error deleting attendance report:', error);
      toast.error('Failed to delete attendance report');
    }
  };

  const refreshReports = async () => {
    await fetchReports();
  };

  // Only fetch reports when user authentication state is resolved and user is authenticated
  useEffect(() => {
    if (!authLoading) {
      fetchReports();
    }
  }, [user, authLoading, fetchReports]);

  const value: AttendanceContextType = {
    reports,
    isLoading,
    addReport,
    deleteReport,
    refreshReports
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}; 