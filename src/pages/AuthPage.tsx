/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Settings } from 'lucide-react';

// Sign In Form Schema
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(0, { message: "Password must be at least 6 characters" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

// Password validation with specific error messages
const passwordRequirements = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Must contain at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Must contain at least one lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Must contain at least one number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Must contain at least one special character",
  });

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordRequirements,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

// Reset Password Form Schema
const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const VERSION = '';

const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Sign In Form
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Sign Up Form
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Reset Password Form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: "",
    },
  });

  const handleSignIn = async (values: SignInFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast.error(error.message || "Failed to sign in");
      } else {
        toast.success("Signed in successfully");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const { error, data } = await signUp(values.email, values.password);
      if (error) {
        toast.error(error.message || "Failed to create account");
      } else {
        toast.success("Account created successfully! Please check your email to verify your account.");
        if (data?.user?.identities?.length === 0) {
          toast.error("This email is already in use. Please sign in instead.");
        } else {
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(values.email);
      if (error) {
        toast.error(error.message || "Failed to send reset password email");
      } else {
        toast.success("Password reset email sent. Please check your inbox.");
        setShowForgotPassword(false);
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stacks-container flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold mb-2">STACKS</h1>
            <span className="ml-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded shadow select-none align-middle">{VERSION}</span>
          </div>
          <p className="text-gray-500">Build your productivity habits</p>
        </div>

        {showForgotPassword ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-stacks-purple hover:bg-stacks-purple/90 text-white" 
                    disabled={isLoading || !resetPasswordForm.formState.isValid}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-stacks-purple data-[state=active]:text-white" 
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-stacks-purple data-[state=active]:text-white" 
                  >
                    Create Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-4">
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Sign In</h2>
                    <Form {...signInForm}>
                      <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                        <FormField
                          control={signInForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signInForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-stacks-purple hover:bg-stacks-purple/90 text-white" 
                          disabled={isLoading}
                        >
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                        <div className="text-center">
                          <button 
                            type="button" 
                            className="text-sm text-stacks-purple hover:underline" 
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot password?
                          </button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="mt-4">
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Create Account</h2>
                    <Form {...signUpForm}>
                      <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                        <FormField
                          control={signUpForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
<FormField
  control={signUpForm.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <Input type="password" placeholder="••••••••" {...field} />
      </FormControl>
      <FormMessage />
      <div className="text-xs text-gray-500 mt-1">
        Password requirements: 8+ characters, uppercase, lowercase, number, special character
      </div>
    </FormItem>
  )}
/>
                        <FormField
                          control={signUpForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-stacks-purple hover:bg-stacks-purple/90 text-white" 
                          disabled={isLoading || !signUpForm.formState.isValid}
                        >
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;