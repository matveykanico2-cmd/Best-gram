import axios from 'axios';

export const platformApi = {
  communities: () => axios.get('/api/communities', { withCredentials: true }).then((r) => r.data),
  createCommunity: (payload: { name: string; description?: string }) => axios.post('/api/communities', payload, { withCredentials: true }).then((r) => r.data),
  marketplace: () => axios.get('/api/marketplace', { withCredentials: true }).then((r) => r.data),
  calls: () => axios.get('/api/calls', { withCredentials: true }).then((r) => r.data),
  videos: () => axios.get('/api/videos', { withCredentials: true }).then((r) => r.data),
};
