export interface RegistrationFormData {
  referralEmail: string;
  referralEmailValid: boolean;
  referredByName: string;
  workspaceName: string;
  workspaceDescription: string;
  // Persona (formerly "organization")
  personaName: string;
  personaDescription: string;
  personaLocation: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  personaPhone: string;
  personaEmail: string;
  personaType: number;
  orderType: number;
  // Admin account
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  confirmPassword: string;
}


export const initialFormData: RegistrationFormData = {
  referralEmail: '',
  referralEmailValid: false,
  referredByName: '',
  workspaceName: '',
  workspaceDescription: '',
  personaName: '',
  personaDescription: '',
  personaLocation: {
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  },
  personaPhone: '',
  personaEmail: '',
  personaType: 0,   // 0 = Food & Beverage
  orderType: 0,     // 0 = Online
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminPassword: '',
  confirmPassword: '',
};

