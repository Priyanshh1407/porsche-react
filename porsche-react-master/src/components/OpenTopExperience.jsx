import React from "react";
import Carousel from "./Carousel";

export default function OpenTopExperience({ theme, heading, description, slides }) {
  // Use heading/description from props, or fallback to first slide
  const carouselHeading = heading || (slides && slides[0]?.heading) || "Open-Top Experience";
  const carouselDescription = description || (slides && slides[0]?.description) || "Experience the Boxster/Cayman's convertible lifestyle, agility, and everyday usability.";

  return (
    <>
      
      <Carousel heading={carouselHeading} description={carouselDescription} data={slides} theme={theme} />
    </>
  );
} 