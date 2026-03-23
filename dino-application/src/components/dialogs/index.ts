/**
 * Dialog Components
 * Centralized exports for all dialog components
 */

import ConfirmationDialogComponent from './ConfirmationDialog';
import DeleteConfirmationDialogComponent from './DeleteConfirmationDialog';

export { default as ConfirmationDialog } from './ConfirmationDialog';
export type { ConfirmationDialogProps } from './ConfirmationDialog';

export { default as DeleteConfirmationDialog } from './DeleteConfirmationDialog';

export { default as FormDialog } from './FormDialog';
export type { FormDialogProps } from './FormDialog';

export { default as PasswordUpdateDialog } from './PasswordUpdateDialog';

export { default as PasswordStrengthIndicator } from './PasswordStrengthIndicator';

// Legacy exports for backward compatibility
export { ConfirmationDialogComponent as ConfirmDialog };
export { DeleteConfirmationDialogComponent as DeleteConfirmationModal };