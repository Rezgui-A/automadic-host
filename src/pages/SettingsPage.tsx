import React, { useState, useRef } from "react";
import { LogOut, Bug, HelpCircle, Lock, Sun, Moon, Palette, Smartphone } from "lucide-react";
import { useTheme } from "next-themes";
import TabBar from "../components/TabBar";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const VERSION = "1.0.0";

const SettingsPage = () => {
  const { user, signOut, session, updatePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showStreaks, setShowStreaks] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleBugReport = () => {
    const subject = encodeURIComponent("Bug Report - STACKS App");
    const body = encodeURIComponent(`Hi Jack,

I found a bug in the STACKS app:

Bug Description:
[Please describe the bug you encountered]

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:
[What should have happened]

Actual Behavior:
[What actually happened]

Additional Information:
- Device: 
- Browser: 
- Time: ${new Date().toLocaleString()}

Thanks!`);

    window.open(`mailto:jack@divergeandconquer.com?subject=${subject}&body=${body}`, "_blank");
  };

  const handleHelp = () => {
    const subject = encodeURIComponent("Help Request - STACKS App");
    const body = encodeURIComponent(`Hi Jack,

I need help with the STACKS app:

Question/Issue:
[Please describe what you need help with]

What I've tried:
[Any steps you've already attempted]

Thanks!`);

    window.open(`mailto:jack@divergeandconquer.com?subject=${subject}&body=${body}`, "_blank");
  };

  const handleResetStreaks = () => {
    toast.success("All streaks have been reset");
  };

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    toast.success(`${checked ? "Dark" : "Light"} mode enabled`);
  };

  const deleteAccount = async () => {
    if (!user || !session) throw new Error("Not authenticated");
    const res = await fetch("https://<YOUR_PROJECT_REF>.functions.supabase.co/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete account");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      window.location.href = "/auth";
    } catch (err) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setShowChangePasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to update password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="stacks-container-with-tabs bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Customize your experience</p>
          </div>
          <Badge variant="outline" className="text-xs py-1 px-2">
            v{VERSION}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Account Settings
              </h3>
            </CardHeader>
            <Separator className="mb-3" />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                    <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
                  </div>
                </div>
                <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Change Password
                      </DialogTitle>
                      <DialogDescription>Secure your account with a new password</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleChangePassword} disabled={isChangingPassword} className="bg-primary hover:bg-primary/90">
                        {isChangingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </h3>
            </CardHeader>
            <Separator className="mb-3" />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">{theme === "dark" ? <Moon className="w-5 h-5 text-orange-600 dark:text-orange-400" /> : <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />}</div>
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{theme === "dark" ? "Dark" : "Light"} mode</p>
                  </div>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">App Icon</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Default</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-sm"></div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M4.2 2C3 2 2 3 2 4.2v11.6C2 17 3 18 4.2 18h4.9l1.6 2.8c.3.5 1 .5 1.3 0l1.6-2.8h4.9c1.2 0 2.2-1 2.2-2.2V4.2C20 3 19 2 17.8 2H4.2z" />
                  <path d="M12 6v6l2 2" />
                </svg>
                Streaks
              </h3>
            </CardHeader>
            <Separator className="mb-3" />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                      <path d="M4.2 2C3 2 2 3 2 4.2v11.6C2 17 3 18 4.2 18h4.9l1.6 2.8c.3.5 1 .5 1.3 0l1.6-2.8h4.9c1.2 0 2.2-1 2.2-2.2V4.2C20 3 19 2 17.8 2H4.2z" />
                      <path d="M12 6v6l2 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Show Streaks</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Display streak counters</p>
                  </div>
                </div>
                <Switch checked={showStreaks} onCheckedChange={setShowStreaks} />
              </div>

              <div className="p-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700">
                      Reset All Streaks
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset All Streaks</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to reset all your streaks? This action cannot be undone and will set all your streak counters back to zero.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetStreaks} className="bg-red-500 hover:bg-red-600">
                        Reset All Streaks
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Support
              </h3>
            </CardHeader>
            <Separator className="mb-3" />
            <CardContent className="space-y-2">
              <button onClick={handleBugReport} className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                    <Bug className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium">Report Bug</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Found an issue? Let us know</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <button onClick={handleHelp} className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Get Help</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Need assistance?</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                About
              </h3>
            </CardHeader>
            <Separator className="mb-3" />
            <CardContent className="space-y-4">
              <div className="p-3">
                <p className="font-medium">STACKS</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Version {VERSION}</p>
              </div>

              <button className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Privacy Policy</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Learn how we handle your data</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-0">
              <button onClick={handleSignOut} className="flex items-center justify-center w-full p-4 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-lg">
                <LogOut className="w-5 h-5 mr-2" />
                <span>Sign Out</span>
              </button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
            </CardHeader>
            <Separator className="mb-3 bg-red-200 dark:bg-red-800/50" />
            <CardContent>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm" onClick={() => setShowDeleteDialog(true)}>
                Delete My Account
              </button>
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is permanent and cannot be undone. All your data will be erased immediately. To confirm, type <span className="font-bold">DELETE</span> below:
                      <Input ref={inputRef} type="text" className="mt-4 w-full" placeholder="Type DELETE to confirm" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} autoFocus />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={deleteInput !== "DELETE" || isDeleting} className="bg-red-500 hover:bg-red-600" onClick={handleDeleteAccount}>
                      {isDeleting ? "Deleting..." : "Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      <TabBar activeTab="settings" />
    </div>
  );
};

export default SettingsPage;
