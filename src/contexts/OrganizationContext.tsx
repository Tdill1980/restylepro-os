import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Organization {
  id: string;
  name: string;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
}

interface OrganizationContextType {
  organization: Organization | null;
  setOrganization: (org: Organization | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(() => {
    // Default organization for demo purposes
    return {
      id: 'demo-org',
      name: 'Demo Organization',
      subscription_tier: 'free'
    };
  });

  return (
    <OrganizationContext.Provider value={{ organization, setOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}