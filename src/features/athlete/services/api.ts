import { store } from "../../../store/root";
import { apiClient } from '../../../services/apiClient';

interface aboutParam {
    about: string;
}

interface bioParams {
    name: string;
    skill: string;
    position: string;
    country: string;
    city: string;
}

interface achievementsParams {
    title: string;
    sport: string;
    date: string;
    description: string;
}

// Fetch unread messages count for athlete
export const fetchUnreadMessagesCount = async () => {
  return apiClient.get('/general/message/athlete/sent');
};

