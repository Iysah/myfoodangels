import { apiClient } from '../../services/apiClient';

// Fetch applicants for a trial by status
export const fetchTrialApplicants = async (trialId: string, page = 1, limit = 20) => {
  const url = `/scout/trial/applicant/by/status?page=${page}&limit=${limit}&trialId=${trialId}`;
  return apiClient.get(url);
};

// Accept an applicant
export const acceptApplicant = async (applicantId: string) => {
  return apiClient.post('/scout/trial/accept', { applicantId });
};

// Reject an applicant
export const rejectApplicant = async (applicantId: string) => {
  return apiClient.post('/scout/trial/reject', { applicantId });
};

// Fetch unread messages count for scout
export const fetchUnreadMessagesCount = async () => {
  return apiClient.get('/general/message/scout/sent');
}; 