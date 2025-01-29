export const metadata = {
  title: "Free Chat with PDF",
  description:
    "Chat with any PDF document for free. No email required. Get instant answers from your PDF files using AI.",
  openGraph: {
    title: "Free Chat with PDF",
    description:
      "Chat with any PDF document for free. No email required. Get instant answers from your PDF files using AI.",
  },
  alternates: {
    canonical: "/examples/chat-with-pdf",
  },
};

export default function ChatWithPdf() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
          Free Chat with PDF
        </h1>
        <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          No email required. 100% free. Done in 30 seconds.
        </p>
      </div>
      <div className="w-full h-96 bg-gray-300 rounded-lg mt-8"></div>
    </>
  );
}
