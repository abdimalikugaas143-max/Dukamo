import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'manager' | 'supervisor';

interface RoleState {
  role: UserRole | null;
  supervisorName: string;
  setRole: (role: UserRole, name?: string) => void;
  clearRole: () => void;
}

const RoleContext = createContext<RoleState | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    return (localStorage.getItem('ops_role') as UserRole) || null;
  });
  const [supervisorName, setSupervisorName] = useState(() => {
    return localStorage.getItem('ops_supervisor_name') || '';
  });

  useEffect(() => {
    if (role) localStorage.setItem('ops_role', role);
    else localStorage.removeItem('ops_role');
  }, [role]);

  function setRole(newRole: UserRole, name?: string) {
    setRoleState(newRole);
    if (newRole === 'supervisor' && name) {
      setSupervisorName(name);
      localStorage.setItem('ops_supervisor_name', name);
    } else if (newRole === 'manager') {
      setSupervisorName('');
      localStorage.removeItem('ops_supervisor_name');
    }
  }

  function clearRole() {
    setRoleState(null);
    setSupervisorName('');
    localStorage.removeItem('ops_role');
    localStorage.removeItem('ops_supervisor_name');
  }

  return (
    <RoleContext.Provider value={{ role, supervisorName, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
