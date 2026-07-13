import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, RecaptchaVerifier, signInWithPhoneNumber, linkWithCredential, PhoneAuthProvider } from 'firebase/auth';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { ensureUserDocument, upsertUserProfile, setUserPhoneOnUserDoc } from '@/integrations/firebase/utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  sendPhoneOtp?: (phoneNumber: string) => Promise<{ error: any }>;
  verifyPhoneOtp?: (verificationId: string, code: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Try to split displayName to derive names on sign-in
          await ensureUserDocument(user);
        } catch (_) {
          // no-op: failing to sync user doc should not block auth state
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(newUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Ensure Firestore user doc exists immediately after signup with first/last names
      try {
        await ensureUserDocument(newUser, { firstName, lastName });
        if (phoneNumber) {
          await upsertUserProfile(newUser.uid, { phoneNumber, phoneVerified: false });
        }
      } catch (_) {}

      toast({
        title: "Account Created!",
        description: "Welcome to QuickX! Your account has been created successfully.",
      });

      return { error: null };
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }

      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      });
      return { error };
    }
  };

  // OTP: send code to the given phone number using reCAPTCHA verifier
  const sendPhoneOtp = async (phoneNumber: string) => {
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      // Return verificationId to be used for confirmation
      return { error: null, verificationId: (confirmation as any).verificationId } as any;
    } catch (error) {
      return { error } as any;
    }
  };

  // OTP: confirm code and link phone to the signed-in user
  const verifyPhoneOtp = async (verificationId: string, code: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(auth.currentUser, credential);
      const phone = auth.currentUser.phoneNumber ?? null;
      await upsertUserProfile(auth.currentUser.uid, { phoneVerified: true, phoneNumber: phone });
      await setUserPhoneOnUserDoc(auth.currentUser.uid, phone, true);
      return { error: null } as any;
    } catch (error) {
      return { error } as any;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to QuickX.",
      });

      return { error: null };
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);

      toast({
        title: "Password Reset Sent!",
        description: "Check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }

      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: errorMessage,
      });
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendPhoneOtp,
    verifyPhoneOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};