import { APP_NAME } from "@/app/consts";
import { Demo } from "./_components/demo";
import { FAQ } from "./_components/faq";
import { DemoVideo } from "./_components/demo-video";

export const metadata = {
  title: "100% Free Chat with PDF",
  description:
    "Chat with any PDF document instantly using our free AI-powered tool! Simply upload your PDF and start asking questions to get quick, accurate answers from your documents. No more endless scrolling or searching - interact naturally with your PDFs and extract the information you need in seconds.",
  alternates: {
    canonical: "/examples/chat-with-pdf",
  },
};

export default function ChatWithPdf() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
          Free Chat with PDF
        </h1>
        <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          No email required. 100% free.
          <br />
          Just upload a PDF and start to chat with it.
        </p>
        <div className="space-y-1 mt-4">
          <p className="text-base text-muted-foreground">
            Try summarizing your PDF or asking questions with our free Chat with
            PDF.
          </p>
          <p className="text-base text-muted-foreground">
            You can build an app like this in minutes with{" "}
            <a
              href="https://www.supavec.com"
              className="underline text-blue-500"
            >
              {APP_NAME}
            </a>
            .
          </p>
        </div>
      </div>
      <Demo />
      <DemoVideo />
      <FAQ />
    </>
  );
}
