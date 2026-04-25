import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from '../common/Auth';
import { useUserData } from './UserData';
import { workspaceService, WorkspaceApprovalData, ApprovalStatus } from '../../services/application/workspace.service';
import StorageManager from '../../utils/storage';

// ── Types ──────────────────────────────────────────────────────────────────────
interface WorkspaceApprovalContextType {
  approvalData: WorkspaceApprovalData | null;
  approvalStatus: ApprovalStatus;
  isApproved: boolean;
  isLoading: boolean;
  /** true once the first check has completed (success or error) */
  isChecked: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceApprovalContext = createContext<WorkspaceApprovalContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────
export const WorkspaceApprovalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  const [approvalData, setApprovalData]   = useState<WorkspaceApprovalData | null>(null);
  const [isLoading,    setIsLoading]      = useState(false);
  const [isChecked,    setIsChecked]      = useState(false);
  const fetchingRef = useRef(false);

  // Derive workspace id from userData
  const workspaceId = userData?.workspace?.id ?? null;

  // Skip check for system users — they bypass approval entirely
  const isSystemUser = StorageManager.getItem<string>('user_type') === 'system';

  const fetchApprovalStatus = useCallback(async () => {
    if (!isAuthenticated || !workspaceId || isSystemUser || fetchingRef.current) return;

    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const data = await workspaceService.getApprovalStatus(workspaceId);
      setApprovalData(data);
    } catch {
      // On error treat as not-yet-approved so we don't silently grant access
      setApprovalData(null);
    } finally {
      setIsLoading(false);
      setIsChecked(true);
      fetchingRef.current = false;
    }
  }, [isAuthenticated, workspaceId, isSystemUser]);

  // Fetch once userData is ready
  useEffect(() => {
    if (!isAuthenticated) {
      setApprovalData(null);
      setIsChecked(false);
      return;
    }
    // Wait for userData to finish loading before we know the workspaceId
    if (userDataLoading) return;
    // System users skip the check
    if (isSystemUser) { setIsChecked(true); return; }
    if (workspaceId && !isChecked && !fetchingRef.current) {
      fetchApprovalStatus();
    }
  }, [isAuthenticated, userDataLoading, workspaceId, isChecked, isSystemUser, fetchApprovalStatus]);

  // Reset when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setApprovalData(null);
      setIsChecked(false);
      fetchingRef.current = false;
    }
  }, [isAuthenticated]);

  const approvalStatus: ApprovalStatus = approvalData?.status ?? null;
  const isApproved = isSystemUser || (approvalData?.approved === true);

  return (
    <WorkspaceApprovalContext.Provider
      value={{
        approvalData,
        approvalStatus,
        isApproved,
        isLoading,
        isChecked,
        refresh: fetchApprovalStatus,
      }}
    >
      {children}
    </WorkspaceApprovalContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useWorkspaceApproval = (): WorkspaceApprovalContextType => {
  const ctx = useContext(WorkspaceApprovalContext);
  if (!ctx) throw new Error('useWorkspaceApproval must be used within WorkspaceApprovalProvider');
  return ctx;
};
