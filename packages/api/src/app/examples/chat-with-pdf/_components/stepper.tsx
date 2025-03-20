"use client";

import { Check, FileText, MessageSquare } from "lucide-react";

const steps = [
  {
    step: 1,
    label: "Upload PDF",
    icon: FileText,
    text: "Choose your document",
  },
  {
    step: 2,
    label: "Chat",
    icon: MessageSquare,
    text: "Ask questions about your PDF",
  },
];

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 my-5">
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: currentStep <= 1 ? "0%" : "100%" }}
          />
        </div>

        <div className="relative flex justify-between">
          {steps.map((step) => {
            return (
              <div className="flex flex-col items-center gap-2" key={step.step}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${currentStep === step.step ? "bg-blue-500" : "bg-muted"}
                    transition-colors duration-300
                  `}
                >
                  {currentStep > step.step ? (
                    <Check className="w-5 h-5 text-foreground" />
                  ) : (
                    <step.icon className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {step.step}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {step.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
