"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/organisms/AuthCard";
import SupportedBrands from "@/components/auth/SupportedBrands";

const LOGIN_FIELDS = [
  {
    id: "identifier",
    name: "identifier",
    label: "Fill your Email",
    type: "email",
    placeholder: "karlbenz@gmail.com",
    icon: "alternate_email",
    required: true,
  },
  {
    id: "password",
    name: "password",
    label: "Fill your Password",
    type: "password",
    placeholder: "••••••••••••",
    icon: "lock",
    forgotLabel: "FORGOT?",
    forgotHref: "#forgot",
    required: true,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    identifier: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback("Autentikasi berhasil! Mengalihkan ke Dashboard GarasiU...");
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col justify-between">
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <AuthCard
          badgeText="Welcome Back to Garasiu"
          gatewayText="Otomotive holic"
          title="Enter your Garage"
          subtitle="Access scheduled service history, fuel consumption analytics, and parts wear monitoring."
          fields={LOGIN_FIELDS}
          formValues={formValues}
          onFieldChange={handleFieldChange}
          rememberChecked={rememberMe}
          onRememberChange={(e) => setRememberMe(e.target.checked)}
          rememberLabel="Remember Me"
          submitLabel="Get In"
          submitIcon="login"
          onSubmit={handleSubmit}
          footerPrompt="Didnt had an account?"
          footerLinkLabel="Create New"
          footerLinkHref="/signup"
          feedbackMessage={feedback}
        />
      </main>

      <SupportedBrands />
    </div>
  );
}
