"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/organisms/AuthCard";
import SupportedBrands from "@/components/auth/SupportedBrands";

const SIGNUP_FIELDS = [
  {
    id: "fullName",
    name: "fullName",
    label: "Owner Full Name",
    type: "text",
    placeholder: "Karl Friedrich Benz",
    icon: "person",
    required: true,
  },
  {
    id: "email",
    name: "email",
    label: "Fill your Email",
    type: "email",
    placeholder: "karlbenz@gmail.com",
    icon: "alternate_email",
    required: true,
  },
  {
    id: "primaryVehicle",
    name: "primaryVehicle",
    label: "Primary Vehicle & License Plate",
    type: "text",
    placeholder: "Lamborghini Aventador • B 1234 ABC",
    icon: "directions_car",
    required: true,
  },
  {
    id: "password",
    name: "password",
    label: "Create Password",
    type: "password",
    placeholder: "••••••••••••",
    icon: "lock",
    required: true,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    primaryVehicle: "",
    password: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [feedback, setFeedback] = useState("");

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback("Akun GarasiU berhasil dibuat! Mengalihkan ke halaman Login...");
    setTimeout(() => {
      router.push("/login");
    }, 700);
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col justify-between">
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <AuthCard
          badgeText="Register New Garage Passport"
          gatewayText="Otomotive holic"
          title="Create Your Garage"
          subtitle="Initialize digital service passport, telemetry tracking, and fuel analytics for your vehicles."
          fields={SIGNUP_FIELDS}
          formValues={formValues}
          onFieldChange={handleFieldChange}
          rememberChecked={agreeTerms}
          onRememberChange={(e) => setAgreeTerms(e.target.checked)}
          rememberLabel="Sync initial telemetry & accept service passport terms"
          submitLabel="Register Garage"
          submitIcon="person_add"
          onSubmit={handleSubmit}
          footerPrompt="Already have a garage account?"
          footerLinkLabel="Sign In Here"
          footerLinkHref="/login"
          feedbackMessage={feedback}
        />
      </main>

      <SupportedBrands />
    </div>
  );
}

