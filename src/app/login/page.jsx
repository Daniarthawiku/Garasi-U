"use client";

import { useState } from "react";
import AuthCard from "@/components/auth/organisms/AuthCard";
import SupportedBrands from "@/components/auth/SupportedBrands";
import { authApi } from "@/lib/api";

const LOGIN_FIELDS = [
  {
    id: "identifier",
    name: "identifier",
    label: "Fill your Email",
    type: "email",
    placeholder: "owner@example.com",
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

function getSafeNextPath() {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export default function LoginPage() {
  const [formValues, setFormValues] = useState({
    identifier: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFeedback("");

    try {
      setIsSubmitting(true);
      await authApi.login({
        email: formValues.identifier,
        password: formValues.password,
        rememberMe,
      });
      setFeedback("Authentication successful! Redirecting to GarasiU Dashboard...");
      window.location.assign(getSafeNextPath());
    } catch (err) {
      setErrorMessage(err?.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
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
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
        />
      </main>

      <SupportedBrands />
    </div>
  );
}
