export interface RegistrationFormData {
  referralCode: string;
  referralCodeValid: boolean;
  referredByName: string;
  workspaceName: string;
  workspaceDescription: string;
  organizationName: string;
  organizationDescription: string;
  organizationLocation: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  organizationPhone: string;
  organizationEmail: string;
  organizationType: number;
  orderType: number;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  confirmPassword: string;
}

export const initialFormData: RegistrationFormData = {
  referralCode: '',
  referralCodeValid: false,
  referredByName: '',
  workspaceName: '',
  workspaceDescription: '',
  organizationName: '',
  organizationDescription: '',
  organizationLocation: {
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  },
  organizationPhone: '',
  organizationEmail: '',
  organizationType: 0, // 0 = FOOD
  orderType: 0, // 0 = Online
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminPassword: '',
  confirmPassword: '',
};
