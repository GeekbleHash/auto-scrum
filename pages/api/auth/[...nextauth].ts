import NextAuth from 'next-auth';
import SlackProvider from 'next-auth/providers/slack';

export default NextAuth({
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_ID,
      clientSecret: process.env.SLACK_SECRET,
    }),
  ],
  callbacks: {
    jwt: ({ token, account }) => {
      // console.log(token);
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      // console.log(account);
      return token;
    },
    session: ({ token, user, session }) => {
      // @ts-ignore
      session.user.accessToken = token.access_token;
      return session;
    },
  },
  secret: 'b2d363fee8f71bd6bb578d214e940a95',
});
