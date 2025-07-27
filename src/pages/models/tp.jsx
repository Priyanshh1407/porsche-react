import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cardData = [
  {
    id: 1,
    category: "Services",
    title: "Web Development",
    description: "We build enterprise-grade web portals, PWAs, e-commerce sites, APIs, and secure, high-performance applications.",
    image: "https://images.unsplash.com/photo-1581091870622-2d7f1fdfb3e7?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 2,
    category: "Services",
    title: "UI/UX",
    description: "From UX research to design systems and accessibility, we craft seamless digital experiences that convert.",
    image: "https://images.unsplash.com/photo-1581091870622-2d7f1fdfb3e7?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 3,
    category: "Services",
    title: "Software Development",
    description: "We engineer scalable MVPs, embedded/IoT systems, AR/VR apps, and cloud-native enterprise solutions.",
    image: "https://images.unsplash.com/photo-1581091870622-2d7f1fdfb3e7?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 4,
    category: "Services",
    title: "AI & Machine Learning",
    description: "We develop AI models, NLU engines, computer vision, personalization systems, and predictive analytics.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde67548?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 5,
    category: "Services",
    title: "Microsoft Technologies",
    description: "We deliver ASP.NET apps, Power BI, SharePoint portals, Sitecore platforms, and Power Platform solutions.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde67548?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 6,
    category: "Services",
    title: "Sales Force",
    description: "From CRM setup to app development and data integration, we offer complete Salesforce cloud services.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde67548?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 7,
    category: "Services",
    title: "Cloud & DevOps",
    description: "We architect SaaS platforms, automate CI/CD pipelines, enable multi-cloud setups, and ensure performance monitoring.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde67548?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 8,
    category: "Services",
    title: "ServiceNow Services",
    description: "We offer workflow design, platform configuration, QA, and fully managed ServiceNow environments.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde67548?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 9,
    category: "Services",
    title: "IT & Digital Consulting",
    description: "From cloud readiness and AI strategy to modernization and cybersecurity posture assessment.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde67548?w=300&h=200&fit=crop",
    price: "Custom",
  },
  {
    id: 10,
    category: "Solutions",
    title: "Digital Transformation",
    description: "We lead ERP deployments, legacy modernization, RPA, data science, and IT architecture planning.",
    image: "https://images.unsplash.com/photo-1581091870622-2d7f1fdfb3e7?w=300&h=200&fit=crop",
    price: "Consult",
  },
  {
    id: 11,
    category: "Solutions",
    title: "Customer Experience & Commerce",
    description: "We create omnichannel experiences using Adobe Commerce, mobile apps, and AI-driven customer journeys.",
    image: "https://images.unsplash.com/photo-1581091870622-2d7f1fdfb3e7?w=300&h=200&fit=crop",
    price: "Consult",
  },
  {
    id: 12,
    category: "Solutions",
    title: "AI & ML Solutions ",
    description: "We build conversational AI, predictive models, fraud detection, document understanding, and more.",
    image: "https://images.unsplash.com/photo-1581091870622-2d7f1fdfb3e7?w=300&h=200&fit=crop",
    price: "Consult",
  },
  {
    id: 13,
    category: "Solutions",
    title: "Generative AI",
    description: "We implement GPT-based assistants, generate content/code, and tune GenAI for enterprise workflows.",
    image: "https://images.unsplash.com/photo-1680537809133-6f0c1628be11?w=300&h=200&fit=crop",
    price: "Consult",
  },
  {
    id: 14,
    category: "Solutions",
    title: "SAP Solutions",
    description: "Our SAP offerings include S/4HANA, Rise with SAP, IBP, cloud integrations, and technical optimization.",
    image: "https://images.unsplash.com/photo-1680537809133-6f0c1628be11?w=300&h=200&fit=crop",
    price: "Consult",
  },
  {
    id: 15,
    category: "Industries",
    title: "Healthcare & Life Sciences",
    description: "Healthcare apps, pharma platforms, AI diagnostics, and compliance-centric tech solutions.",
    image: "https://images.unsplash.com/photo-1588776814546-ec7d71e90a6d?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 16,
    category: "Industries",
    title: "Retail & eCommerce",
    description: "AI commerce, personalized shopping, order tracking, omnichannel, and scalable store systems.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 17,
    category: "Industries",
    title: "Banking, Finance & Fintech",
    description: "Custom fintech platforms, KYC automation, fraud detection, mobile banking & reporting tools.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 18,
    category: "Industries",
    title: "Manufacturing & Industrial Engineering",
    description: "Predictive maintenance, IoT dashboards, factory automation, and supply chain analytics.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 19,
    category: "Industries",
    title: "Education & Learning Technologies",
    description: "E-learning platforms, LMS systems, AI-based assessments, and gamified learning solutions.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 20,
    category: "Industries",
    title: "Supply Chain & Logistics ",
    description: "Fleet tracking, delivery optimization, warehouse automation, and real-time logistics insights.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 21,
    category: "Industries",
    title: "Commercial Real Estate & PropTech",
    description: "Smart building management, property listing portals, 3D visualization & analytics tools.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 22,
    category: "Industries",
    title: "Travel, Transport & Hospitality",
    description: "Smart bookings, itinerary planners, hotel automation, mobility & immersive AR experiences.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 23,
    category: "Industries",
    title: "Government & Smart Cities",
    description: "E-governance platforms, smart citizen services, traffic monitoring, and urban AI solutions.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
  {
    id: 24,
    category: "Industries",
    title: "Energy, Oil & Utilities",
    description: "Smart grid management, energy monitoring, pipeline analytics, and digital twin modeling.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
    price: "Industry",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCards = activeTab === "all" 
    ? cardData 
    : cardData.filter(card => card.category === activeTab);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-black backdrop-blur-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 text-white">Featured Courses</h1>
              <p className="text-gray-600">Discover our curated selection of professional courses</p>
            </div>

            {/* Category Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-black h-12">
                <TabsTrigger value="Services" className="px-6">Services</TabsTrigger>
                <TabsTrigger value="Solutions" className="px-6">Solutions</TabsTrigger>
                <TabsTrigger value="Industries" className="px-6">Industries</TabsTrigger>
                <TabsTrigger value="Responsibility" className="px-6">Responsibility</TabsTrigger>
                <TabsTrigger value="About" className="px-6">About</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Cards Section */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
              {filteredCards.map((card) => (
                <Card 
                  key={card.id} 
                  className="flex-shrink-0 w-80 bg-black border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="relative">
                    <img 
                      src={card.image} 
                      alt={card.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black text-gray-900 px-2 py-1 rounded text-sm font-medium">
                      {card.price}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1 text-white">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {card.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black text-gray-700 capitalize">
                        {card.category}
                      </span>
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                        Learn More →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={scrollLeft}
              className="flex items-center justify-center w-12 h-12 bg-black border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollRight}
              className="flex items-center justify-center w-12 h-12 bg-black border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600">No courses found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;