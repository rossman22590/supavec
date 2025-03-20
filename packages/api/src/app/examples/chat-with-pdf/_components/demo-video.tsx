import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export const DemoVideo = () => {
  return (
    <section>
      <div className="mx-auto w-full text-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y text-muted-foreground">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Answers to common questions about our free Chat with PDF app.
            </p>
          </div>
        </div>
        <HeroVideoDialog
          className="block max-w-4xl mx-auto px-4 mt-10"
          previewClassName="rounded-lg"
          animationStyle="from-center"
          videoSrc="https://qxxlcbvvszqlusrmczke.supabase.co/storage/v1/object/public/public-files/supavec-pdf-demo.mp4"
          thumbnailSrc="/supavec-pdf-demo-cover.jpg"
          thumbnailAlt="Supavec Chat with PDF Demo"
        />
      </div>
    </section>
  );
};
