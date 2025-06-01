
import { useState, useEffect } from 'react';

interface ConsentData {
  dataProcessing: boolean;
  aiAnalysis: boolean;
  voiceRecording: boolean;
  analytics: boolean;
}

interface ConsentRecord {
  consents: ConsentData;
  timestamp: string;
  version: string;
}

export const usePrivacyConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [consentData, setConsentData] = useState<ConsentRecord | null>(null);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  useEffect(() => {
    checkExistingConsent();
  }, []);

  const checkExistingConsent = () => {
    try {
      const storedConsent = localStorage.getItem('privacy_consent');
      const consentTimestamp = localStorage.getItem('consent_timestamp');
      
      if (storedConsent && consentTimestamp) {
        const parsedConsent = JSON.parse(storedConsent);
        const consentRecord: ConsentRecord = {
          consents: parsedConsent,
          timestamp: consentTimestamp,
          version: '1.0'
        };
        
        setConsentData(consentRecord);
        
        // Check if required consents are granted
        const hasRequiredConsents = parsedConsent.dataProcessing && parsedConsent.aiAnalysis;
        setHasConsent(hasRequiredConsents);
        
        if (!hasRequiredConsents) {
          setShowConsentModal(true);
        }
      } else {
        setShowConsentModal(true);
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      setShowConsentModal(true);
    }
  };

  const grantConsent = (consents: ConsentData) => {
    const timestamp = new Date().toISOString();
    const consentRecord: ConsentRecord = {
      consents,
      timestamp,
      version: '1.0'
    };

    // Store consent data
    localStorage.setItem('privacy_consent', JSON.stringify(consents));
    localStorage.setItem('consent_timestamp', timestamp);
    
    setConsentData(consentRecord);
    
    // Check if required consents are granted
    const hasRequiredConsents = consents.dataProcessing && consents.aiAnalysis;
    setHasConsent(hasRequiredConsents);
    setShowConsentModal(false);

    console.log('Privacy consent granted:', consentRecord);
  };

  const withdrawConsent = () => {
    localStorage.removeItem('privacy_consent');
    localStorage.removeItem('consent_timestamp');
    
    setConsentData(null);
    setHasConsent(false);
    setShowConsentModal(true);

    console.log('Privacy consent withdrawn');
  };

  const requestConsent = () => {
    setShowConsentModal(true);
  };

  return {
    hasConsent,
    consentData,
    showConsentModal,
    grantConsent,
    withdrawConsent,
    requestConsent,
    closeConsentModal: () => setShowConsentModal(false)
  };
};
