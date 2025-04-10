import { APP_NAME } from "@/app/consts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Successful",
  description: "Your subscription has been successfully activated",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
