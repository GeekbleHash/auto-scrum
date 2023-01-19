// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';

const rest = axios.create({
  baseURL: `${process.env.SERVER_URL}/api`,
});

class RestApi {
  static getPrevScrum = (accessToken: string, channel: string, user: string) => rest.get<string[]>('/history', { params: { accessToken, channel, user } });

  static sendScrum = (accessToken: string, channel: string, scrum: string) => rest.post('/send', { accessToken, channel, scrum });
}

export default RestApi;
