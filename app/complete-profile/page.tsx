"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function CompleteProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Format wallet address to show first 6 and last 4 characters
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Not connected";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/quests/users/${address}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      toast.success("Profile saved successfully!");
      // Redirect to quests page after saving
      router.push("/quests");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect if wallet not connected
  useEffect(() => {
    if (!isConnected || !address) {
      router.push("/");
    }
  }, [isConnected, address, router]);

  if (!isConnected || !address) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative max-w-7xl mx-auto">
        {/* Left vertical line */}
        <div className="hidden sm:block w-px h-full absolute left-0 top-0 bg-black z-0"></div>

        {/* Right vertical line */}
        <div className="hidden sm:block w-px h-full absolute right-0 top-0 bg-black z-0"></div>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Complete Your Profile
            </h1>
            <p className="text-base text-muted-foreground">
              Let's get to know you better! Fill in your details to start
              earning rewards.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-md">
            {/* Wallet Address */}
            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-foreground">
                Wallet Address
              </Label>
              <div className="px-3 py-2 bg-secondary/20 border border-secondary rounded-md">
                <p className="text-sm font-mono text-foreground">
                  {formatAddress(address)}
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-foreground flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-foreground flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                We'll use this to send you quest updates and rewards
                notifications.
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="default"
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
