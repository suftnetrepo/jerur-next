import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from './app/models/user';
import { mongoConnect } from './utils/connectDb';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await mongoConnect(); 
      
        try {
          const user = await User.findOne({
            email: new RegExp(`^${credentials.email}$`, 'i')
          });
      
          if (!user) {
            return null; 
          }
      
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isMatch) {
            return null; 
          }
      
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            church: user.church.toString(),
            first_name: user.first_name,
            last_name: user.last_name
          };
        } catch (error) {
          console.error('Authentication error:', error.message);
          return null; 
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: false,
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.church = user.church;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
        church: token.church,
        first_name: token.first_name,
        last_name: token.last_name
      };
      return session;
    }
  },
  events: {
    signOut(message) {
      console.log('User signed out:', message);
    }
  },
  pages: {
    signIn: '/login',
    error: '/error' 
  }
});
