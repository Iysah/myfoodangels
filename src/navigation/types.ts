export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  RoleSelection: undefined;
  ForgetPassword: undefined;
  VerifyEmail: undefined;
  CreatePassword: undefined;

  // Onboarding Stack
  Onboarding: undefined;
  Welcome: undefined;
  SelectRole: undefined;

  // Main App Stack
  AthleteTabs: undefined;
  ScoutTabs: undefined;
  SearchTalent: undefined;
  TalentDetails: { talentId: string };
  Chats: undefined;
  ChatDetail: { chatId: string };
  EventDetails: { eventId: string };
  Register: undefined;
  Notifications: undefined;

  // Settings Stack
  Settings: undefined;
  ProfileSettings: undefined;
  AccountSettings: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  Help: undefined;
}; 