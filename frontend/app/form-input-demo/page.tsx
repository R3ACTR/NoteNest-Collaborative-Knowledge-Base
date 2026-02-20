"use client";

import { useState } from "react";
import FormInput from "@/components/ui/FormInput";

export default function FormInputDemo() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">FormInput Demo</h1>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Default Input</h2>
          <FormInput
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">With Helper Text</h2>
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="Must be at least 8 characters"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">With Error</h2>
          <FormInput
            label="Username"
            placeholder="Enter username"
            error="Username is required"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Disabled</h2>
          <FormInput
            label="Disabled Input"
            placeholder="Cannot edit"
            disabled
            defaultValue="Disabled value"
          />
        </section>
      </div>
    </div>
  );
}
