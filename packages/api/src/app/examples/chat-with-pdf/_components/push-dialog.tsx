"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { posthog } from "posthog-js";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/app/consts";
import meDialog from "..//me-dialog.png";
import Image from "next/image";

export const PushDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-[600px]">
          <DialogHeader>
            <Image
              src={meDialog}
              className="w-full"
              alt="Want to Build an AI app in minutes with your data?"
            />

            <DialogTitle className="text-center text-xl font-bold mt-8">
              Build your next AI app with {APP_NAME} in minutes.
            </DialogTitle>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="pb-8">
        <DrawerHeader className="text-left">
          <Image
            src={meDialog}
            className="w-full"
            alt="Want to Build an AI app in minutes with your data?"
          />

          <DrawerTitle className="text-center text-lg font-bold mt-8">
            Build your next AI app with {APP_NAME} in minutes.
          </DrawerTitle>
        </DrawerHeader>
        <ProfileForm />
      </DrawerContent>
    </Drawer>
  );
};

function ProfileForm() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-y-3">
      <ButtonColorful
        className="z-10"
        label="Create your Chat with PDF app"
        onClick={() => {
          posthog.capture(
            "Click Dialog CTA in Chat with PDF example",
            {},
            {
              send_instantly: true,
            }
          );

          router.push(
            "https://www.supavec.com/login?src=examples-chat-with-pdf"
          );
        }}
      />
    </div>
  );
}
