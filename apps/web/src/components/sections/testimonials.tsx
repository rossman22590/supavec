"use client";

import { Section } from "@/components/section";
import { useEffect } from "react";

export function Testimonials() {
  useEffect(() => {
    // Load the Senja widget script
    const script = document.createElement("script");
    script.src = "https://widget.senja.io/widget/698903f7-82e1-43c9-a1e4-507b33742e0a/platform.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Section id="testimonials" title="Testimonials">
      <div className="border-t border-x">
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-2/6 w-[calc(100%-2px)] overflow-hidden bg-gradient-to-t from-background to-transparent"></div>
        
        <div 
          className="senja-embed" 
          data-id="698903f7-82e1-43c9-a1e4-507b33742e0a" 
          data-mode="shadow" 
          data-lazyload="false" 
          style={{ display: "block", width: "100%" }}
        ></div>
      </div>
    </Section>
  );
}
