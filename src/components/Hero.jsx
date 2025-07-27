const Hero = ({ data,theme }) => {
    return (
        <section className="relative w-full h-screen">
            <div className="absolute inset-0">
                <img
                    src={data.image}
                    alt={`Porsche ${theme.name}`}
                    className="w-full h-full object-cover"
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Gradient overlay for more sophisticated darkening */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
            </div>

            <div className={`relative z-10 flex flex-col items-center justify-center h-full font-montserrat ${theme.textAccent} text-center px-4`}>
                <div className="text-center max-w-4xl mx-auto">
                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wider text-white mb-6 leading-tight">
                        <span className={`block ${theme.text} text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-2`}>
                            {data.title}
                        </span>
                        {data.fullName}
                    </h1>

                    {/* Subtitle */}
                    <p className={`text-xl md:text-2xl lg:text-3xl font-light ${theme.textSecondary} mb-8 tracking-wide`}>
                        {data.subtitle}
                    </p>

                    {/* Decorative Line */}
                    <div className={`w-24 h-1 bg-gradient-to-r ${theme.gradient} mx-auto mb-8`}></div>

                    {/* Additional Text */}
                    <p className="text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed">
                        {data.description}
                    </p>
                </div>
            </div>
        </section >
    )
}

export default Hero