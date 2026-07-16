import React from "react";
import { CheckCircle, Lightbulb, Users, Tv2, Thermometer } from "lucide-react";
import InteriorComfort from "../assets/panamera/interior-comfort.jpeg";

export default function InteriorComforts({ theme }) {
  return (
    <section className={`relative w-full min-h-[600px] flex flex-col md:flex-row items-stretch justify-center koenig-section-root`}>
      <style>{`
        .koenig-section-root {
          height: 100vh;
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 900px) {
          .koenig-section-root {
            flex-direction: row;
          }
        }
        .koenig-left {
          background: rgba(24, 20, 10, 0.92);
          color: #fff;
          flex: 1 1 0%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 3.5rem 2.5rem 3.5rem 4.5rem;
          min-width: 320px;
          max-width: 600px;
          height: 100vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #fbbf24 #18181b;
          box-shadow: 0 4px 24px 0 #fbbf2411;
        }
        .koenig-left::-webkit-scrollbar {
          width: 8px;
        }
        .koenig-left::-webkit-scrollbar-thumb {
          background: #fbbf24;
          border-radius: 6px;
        }
        .koenig-left::-webkit-scrollbar-track {
          background: #18181b;
        }
        .koenig-feature-list {
          font-size: 1.1rem;
          color: #fffbe6;
          margin-bottom: 2.5rem;
          padding-left: 0;
          transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s;
          overflow-y: auto;
          max-height: 40vh;
          background: rgba(30, 20, 10, 0.55);
          border-radius: 1.25rem;
          box-shadow: 0 4px 24px 0 #fbbf2411;
          border-left: 4px solid #fbbf24;
          padding: 2rem 2rem 2rem 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: #fbbf24 #18181b;
          position: relative;
        }
        .koenig-feature-list::-webkit-scrollbar {
          width: 6px;
        }
        .koenig-feature-list::-webkit-scrollbar-thumb {
          background: #fbbf24;
          border-radius: 6px;
        }
        .koenig-feature-list::-webkit-scrollbar-track {
          background: #18181b;
        }
        .koenig-feature-list:after {
          content: '';
          display: block;
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 18px;
          pointer-events: none;
          background: linear-gradient(to bottom, rgba(30,20,10,0), rgba(30,20,10,0.7));
          opacity: 0.7;
        }
        .koenig-feature-list.collapsed {
          max-height: 8.5em;
          opacity: 1;
        }
        .koenig-feature-list.expanded {
          max-height: 40vh;
          opacity: 1;
        }
        .koenig-feature-list li {
          margin-bottom: 1.1rem;
          list-style: none;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.13rem;
        }
        .koenig-feature-list li:last-child { margin-bottom: 0; }
        .koenig-icon {
          color: #fbbf24;
          flex-shrink: 0;
        }
        .koenig-section {
          color: #fbbf24;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }
        .koenig-headline {
          font-size: 2.3rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
        }
        .koenig-underline {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #fbbf24 0%, #fffbe6 100%);
          border-radius: 2px;
          margin-bottom: 2.5rem;
        }
        .koenig-body {
          font-size: 1.15rem;
          color: #fff;
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }
        .koenig-more-link {
          color: #fbbf24;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          margin-top: 1.5rem;
          transition: color 0.2s;
        }
        .koenig-more-link:hover { color: #fffbe6; }
        .koenig-image {
          flex: 1 1 0%;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          background: #18181b;
          min-width: 320px;
          padding: 0;
          height: 100%;
          position: relative;
        }
        .koenig-image img {
          width: 100%;
          height: 100%;
          border-radius: 0;
          object-fit: cover;
          box-shadow: none;
          display: block;
        }
        @media (max-width: 900px) {
          .koenig-section-root {
            flex-direction: column;
            height: auto;
            min-height: 0;
          }
          .koenig-left {
            padding: 2.5rem 1.2rem 2.5rem 1.2rem;
            max-width: 100vw;
            height: auto;
            overflow-y: visible;
          }
          .koenig-feature-list {
            max-height: 220px;
          }
          .koenig-image {
            min-width: 0;
            padding: 0;
            height: 220px;
            width: 100vw;
          }
          .koenig-image img {
            max-width: 100vw;
            border-radius: 0;
            height: 220px;
            width: 100vw;
          }
        }
      `}</style>
      {/* Left: Info block */}
      <div className="koenig-left">
        <div className="koenig-section">01</div>
        <div className="koenig-headline">Panamera Executive Interior</div>
        <div className="koenig-underline" />
        <div className="koenig-body">
          The Panamera’s interior is a sanctuary of comfort and technology, offering every passenger a first-class experience worthy of the world’s finest grand tourers.<br /><br />
          Every surface, stitch, and detail is crafted for comfort and sophistication. Enjoy customizable ambient lighting, heated and massaging rear seats, and a rear entertainment system with wireless headphones.
        </div>
        <ul className="koenig-feature-list expanded">
          <li><Lightbulb size={20} className="koenig-icon" />64-color ambient lighting, customizable for every mood</li>
          <li><Users size={20} className="koenig-icon" />Heated, ventilated, and massaging rear seats</li>
          <li><Tv2 size={20} className="koenig-icon" />Rear-seat entertainment with wireless headphones</li>
          <li><Thermometer size={20} className="koenig-icon" />4-zone climate, ionizer, fragrance system</li>
          <li><Lightbulb size={20} className="koenig-icon" />Panoramic sunroof, privacy shades</li>
          <li><Users size={20} className="koenig-icon" />Executive rear console with touchscreen controls</li>
          <li><Tv2 size={20} className="koenig-icon" />21-speaker Burmester® 3D High-End Surround Sound</li>
          <li><Lightbulb size={20} className="koenig-icon" />Hand-stitched leather, wood, and metal accents</li>
          <li><Users size={20} className="koenig-icon" />Rear-seat refrigerator, folding tables</li>
          <li><Lightbulb size={20} className="koenig-icon" />Customizable ambient themes, illuminated door sills</li>
          <li><Tv2 size={20} className="koenig-icon" />Wireless device charging, Wi-Fi hotspot</li>
          <li><Thermometer size={20} className="koenig-icon" />Air quality sensors, pollen filter</li>
        </ul>
      </div>
      {/* Right: Large, crisp image */}
      <div className="koenig-image">
        <img src={InteriorComfort} alt="Panamera Interior" />
      </div>
    </section>
  );
} 