import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react';

const isValidDataArray = (data) => {
    return Array.isArray(data) && data.length > 0;
};

const Carousel = ({ heading, description, data, theme }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    // Mouse and Touch drag functionality
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(null);
    const [endX, setEndX] = useState(null);
    // Touch/Swipe functionality
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [slideWidth, setSlideWidth] = useState(320);
    const [slideGap, setSlideGap] = useState(16);



    const nextSlide = () => {
        setCurrentSlide((prev) => Math.min(prev + 1, data.length));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') {
                prevSlide();
            } else if (event.key === 'ArrowRight') {
                nextSlide();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Mouse and Touch drag functionality
    // Mouse events
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setEndX(null);
        setStartX(e.clientX);
        e.preventDefault(); // Prevent text selection
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setEndX(e.clientX);
    };

    const handleMouseUp = () => {
        if (!isDragging || !startX || !endX) {
            setIsDragging(false);
            return;
        }

        const distance = startX - endX;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }

        setIsDragging(false);
        setStartX(null);
        setEndX(null);
    };

    // Touch/Swipe functionality
    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    const handleContextMenu = (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    };

    const getSlideWidth = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width < 640) return width - 48; // Mobile - full width minus padding
            if (width < 768) return width - 64; // Small tablet
            if (width < 1024) return 500; // Tablet
            return 700; // Desktop
        }
        return 280;
    };

    const getSlideGap = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 0; // Mobile
            if (window.innerWidth < 1024) return 24; // Tablet
            return 80; // Desktop
        }
        return 0;
    };

    useEffect(() => {
        const handleResize = () => {
            setSlideWidth(getSlideWidth());
            setSlideGap(getSlideGap());
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isValidDataArray(data)) {
        return (
            <div className="text-white text-center py-20">
                No data provided for the carousel.
            </div>
        );
    }


    return (
        <section className="bg-transparent text-white min-h-screen flex flex-col justify-center items-center p-8 sm:p-10 lg:p-12">
            <div className="max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 sm:mb-8 text-white">
                        {heading}
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Navigation arrows */}
                <div className="hidden sm:flex justify-end mb-6 lg:mb-8 gap-3 lg:gap-4">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="p-3 lg:p-3 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === data.length - 1}
                        className="p-3 lg:p-3 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Horizontal scroll carousel */}
                <div className='relative w-full px-4 sm:px-0'>
                    <div
                        className={`relative overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp} // Handle mouse leaving the area
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onContextMenu={handleContextMenu}
                    >
                        <div
                            className="flex transition-transform duration-500 ease-out gap-20"
                            style={{ transform: `translateX(-${currentSlide * 720}px)` }}
                        >
                            {data.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className="flex-shrink-0 w-[700px] cursor-pointer"
                                    onClick={() => !isDragging && goToSlide(index)}
                                >
                                    {/* Horizontal card layout */}
                                    <div className="bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm rounded-xl lg:rounded-2xl overflow-hidden flex flex-col sm:flex-row h-auto sm:h-[350px] lg:h-[400px] w-full">
                                        {/* Image section - Left side */}
                                        <div className="relative w-full sm:w-1/2 h-48 sm:h-full">
                                            <img
                                                src={slide.image}
                                                alt={slide.imageAlt}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Gradient accent */}
                                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>
                                        </div>

                                        {/* Content section - Right side */}
                                        <div className="w-full sm:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                                            <div className="mb-4 sm:mb-6">
                                                <h3 className="text-lg sm:text-xl lg:text-2xl font-light leading-tight mb-3 sm:mb-4 lg:mb-6 text-white">
                                                    {slide.title}
                                                </h3>
                                                <p className={`text-base leading-relaxed text-slate-400`}>
                                                    {slide.description}
                                                </p>
                                            </div>

                                            {/* Active indicator */}
                                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50">
                                                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                                    ? `bg-gradient-to-r ${theme?.gradient || 'from-yellow-400 to-orange-500'}`
                                                    : 'bg-slate-600'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dots indicator */}
                <div className="flex justify-center mt-8 sm:mt-10 lg:mt-12 space-x-2 sm:space-x-3">
                    <div className='flex space-x-2 sm:space-x-3'>
                        {data.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? `bg-gradient-to-r ${theme?.gradient || 'from-yellow-400 to-orange-500'}`
                                    : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Mobile navigation indicators */}
                <div className="flex sm:hidden justify-center mt-6 space-x-4">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="p-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/30 rounded-full border border-slate-700/50">
                        <span className="text-white text-sm font-medium">{currentSlide + 1}</span>
                        <span className="text-slate-500 text-sm">of</span>
                        <span className="text-slate-400 text-sm">{data.length}</span>
                    </div>
                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === data.length - 1}
                        className="p-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Carousel