import { useState, useEffect, useCallback } from 'react';

// Define the structure for all form data
export interface BabyTrackerFormData {
  feeding: {
    amount: string;
    notes: string;
    timestamp: string;
  };
  sleep: {
    duration: string;
    notes: string;
    startTime: string;
    endTime: string;
    timestamp: string;
  };
  diaper: {
    type: string;
    notes: string;
    timestamp: string;
  };
  poop: {
    consistency: string;
    notes: string;
    timestamp: string;
  };
  doctor: {
    appointmentType: string;
    notes: string;
    questions: string;
    date: string;
    location: string;
    doctorName: string;
    hospitalName: string;
  };
  temperature: {
    temperature: string;
    unit: 'celsius' | 'fahrenheit';
    notes: string;
    timestamp: string;
  };
  medication: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string;
    timestamp: string;
  };
  vaccination: {
    vaccineName: string;
    doseNumber: string;
    administeredBy: string;
    nextDueDate: string;
    notes: string;
    timestamp: string;
  };
  milestone: {
    milestoneType: string;
    description: string;
    dateAchieved: string;
    notes: string;
    timestamp: string;
  };
  growth: {
    weight: string;
    height: string;
    headCircumference: string;
    date: string;
    notes: string;
    timestamp: string;
  };
  symptoms: {
    symptomType: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    startDate: string;
    endDate: string;
    notes: string;
    timestamp: string;
  };
}

// Default form values
export const defaultFormData: BabyTrackerFormData = {
  feeding: { amount: '', notes: '', timestamp: '' },
  sleep: { duration: '', notes: '', startTime: '', endTime: '', timestamp: '' },
  diaper: { type: '', notes: '', timestamp: '' },
  poop: { consistency: '', notes: '', timestamp: '' },
  doctor: {
    appointmentType: '',
    notes: '',
    questions: '',
    date: '',
    location: '',
    doctorName: '',
    hospitalName: ''
  },
  temperature: {
    temperature: '',
    unit: 'celsius',
    notes: '',
    timestamp: ''
  },
  medication: {
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    timestamp: ''
  },
  vaccination: {
    vaccineName: '',
    doseNumber: '',
    administeredBy: '',
    nextDueDate: '',
    notes: '',
    timestamp: ''
  },
  milestone: {
    milestoneType: '',
    description: '',
    dateAchieved: '',
    notes: '',
    timestamp: ''
  },
  growth: {
    weight: '',
    height: '',
    headCircumference: '',
    date: '',
    notes: '',
    timestamp: ''
  },
  symptoms: {
    symptomType: '',
    severity: 'mild',
    description: '',
    startDate: '',
    endDate: '',
    notes: '',
    timestamp: ''
  }
};

export function useBabyTrackerLocalStorage() {
  // Get from local storage then parse stored json or return default values
  const readValue = (): BabyTrackerFormData => {
    // Prevent build errors during server-side rendering
    if (typeof window === 'undefined') {
      return defaultFormData;
    }

    try {
      const item = window.localStorage.getItem('baby-tracker-form-data');
      return item ? JSON.parse(item) : defaultFormData;
    } catch (error) {
      console.warn('Error reading localStorage key "baby-tracker-form-data":', error);
      return defaultFormData;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<BabyTrackerFormData>(defaultFormData);

  // Initialize stored value on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, []);

  // Update a specific form's data
  const updateFormData = useCallback((formType: keyof BabyTrackerFormData, data: Partial<BabyTrackerFormData[typeof formType]>) => {
    try {
      const newValue = {
        ...storedValue,
        [formType]: {
          ...storedValue[formType],
          ...data
        }
      };
      
      // Save state
      setStoredValue(newValue);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('baby-tracker-form-data', JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error updating localStorage for form type "${formType}":`, error);
    }
  }, [storedValue]);

  // Get a specific form's data
  const getFormData = useCallback((formType: keyof BabyTrackerFormData) => {
    return storedValue[formType];
  }, [storedValue]);

  // Clear a specific form's data
  const clearFormData = useCallback((formType: keyof BabyTrackerFormData) => {
    try {
      const newValue = {
        ...storedValue,
        [formType]: defaultFormData[formType]
      };
      
      // Save state
      setStoredValue(newValue);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('baby-tracker-form-data', JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error clearing localStorage for form type "${formType}":`, error);
    }
  }, [storedValue]);

  // Reset all form data
  const resetAllFormData = useCallback(() => {
    try {
      setStoredValue(defaultFormData);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('baby-tracker-form-data', JSON.stringify(defaultFormData));
      }
    } catch (error) {
      console.warn('Error resetting all localStorage data:', error);
    }
  }, []);

  // Listen for storage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'baby-tracker-form-data' && event.newValue) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.warn('Error parsing localStorage change for key "baby-tracker-form-data":', error);
        }
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    formData: storedValue,
    updateFormData,
    getFormData,
    clearFormData,
    resetAllFormData
  };
}