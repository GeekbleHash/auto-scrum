import NextAuth from 'next-auth';
import SlackProvider from 'next-auth/providers/slack';
import MemberEmails from '../../../libs/Emails';

export default NextAuth({
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_ID,
      clientSecret: process.env.SLACK_SECRET,
      idToken: true,
    }),
  ],
  callbacks: {
    jwt: ({ token, account }) => {
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      return token;
    },
    session: ({ token, user, session }) => {
      // @ts-ignore
      session.user.accessToken = token.access_token;
      for (let i = 0; i < MemberEmails.length; i += 1) {
        const member = MemberEmails[i];
        // 닉네임이 아닌것들 캐스팅
        if (session.user?.email === member.email) {
          session.user.name = member.name;
          break;
        }
      }
      return session;
    },
  },
  secret: 'b2d363fee8f71bd6bb578d214e940a95',
});
