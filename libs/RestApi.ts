// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';

const rest = axios.create({
  baseURL: '/api',
});

class RestApi {
  static getPrevScrum = (accessToken: string, channel: string, user: string) => rest.get<string[]>('/history', { params: { accessToken, channel, user } });

  static sendScrum = (
    accessToken: string,
    channel: string,
    name: string,
    date: string,
    time: string,
    isHome: boolean,
    content: string,
    postAt?: number,
  ) => rest.post('/send', {
    accessToken, channel, date, time, isHome, content, name, postAt,
  });
}

export default RestApi;
