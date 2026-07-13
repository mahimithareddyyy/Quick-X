import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, UserCheck, Mail, Lock, User, GraduationCap, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { user, signIn, signUp, loading, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    
    await signUp(email, password, firstName, lastName, phoneNumber);
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsResetLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('resetEmail') as string;
    
    const { error } = await resetPassword(email);
    setIsResetLoading(false);
    
    if (!error) {
      setIsDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-pulse">
          <img 
            src="/lovable-uploads/058fa7fe-01a6-425a-a726-bce5c262ab90.png" 
            alt="QuickX Logo" 
            className="h-20 w-auto mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/058fa7fe-01a6-425a-a726-bce5c262ab90.png" 
              alt="QuickX Logo" 
              className="h-20 w-auto"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Secure Campus Exchange
            </h1>
            <p className="text-muted-foreground">Join the trusted student community</p>
          </div>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Verified Students</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
              <UserCheck className="h-6 w-6 text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground">Trust Scores</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Campus Lock</p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="border-border/50 shadow-lg">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Join Now</TabsTrigger>
            </TabsList>
            
            {/* Sign In Tab */}
            <TabsContent value="signin">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Sign in to access secure peer-to-peer exchanges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">College Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your.name@vishnu.edu.in"
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                
                {/* Forgot Password Dialog */}
                <div className="mt-4 text-center">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                        Forgot your password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <KeyRound className="h-5 w-5 text-primary" />
                          Reset Password
                        </DialogTitle>
                        <DialogDescription>
                          Enter your college email address and we'll send you a password reset link.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resetEmail">College Email</Label>
                          <Input
                            id="resetEmail"
                            name="resetEmail"
                            type="email"
                            placeholder="your.name@vishnu.edu.in"
                            required
                            className="bg-background/50"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="flex-1"
                            disabled={isResetLoading}
                          >
                            {isResetLoading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-secondary" />
                  Create Account
                </CardTitle>
                <CardDescription>
                  Join the trusted campus exchange community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        required
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">College Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your.name@vishnu.edu.in"
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Mobile Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="9876543210"
                      pattern="[0-9]{10,15}"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="bg-background/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
                
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Next Steps</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Student ID verification required</li>
                    <li>• Upload college ID card</li>
                    <li>• Initial trust score: 50/100</li>
                  </ul>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>🔒 All transactions are secured with end-to-end verification</p>
          <p className="mt-1">Campus-locked access for student safety</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;