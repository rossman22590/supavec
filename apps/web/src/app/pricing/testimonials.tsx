"use client";

import { useEffect, useRef } from "react";

export const Testimonials = () => {
  const senjaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (senjaContainerRef.current) {
      const script = document.createElement("script");
      script.src =
        "https://widget.senja.io/widget/698903f7-82e1-43c9-a1e4-507b33742e0a/platform.js";
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <section className="mt-20 md:mt-24">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">
        What people are saying
      </h2>
      
      <div className="border-t border-x">
        <div className="pointer-events-none absolute w-full h-2/6 overflow-hidden bg-gradient-to-t from-background to-transparent"></div>
        
        <div 
          ref={senjaContainerRef}
          className="senja-embed" 
          data-id="698903f7-82e1-43c9-a1e4-507b33742e0a" 
          data-mode="shadow" 
          data-lazyload="false" 
          style={{ display: "block", width: "100%" }}
        ></div>
      </div>
    </section>
  );
};
