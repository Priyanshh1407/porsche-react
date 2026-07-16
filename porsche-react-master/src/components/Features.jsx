import { useState } from 'react';

const Features = ({ data, theme }) => {
    const [selectedCategory, setSelectedCategory] = useState('Engine');

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    }

    return (
        <section className="relative text-white min-h-screen flex items-center justify-center p-8 overflow-hidden">
            {/* Dark Porsche background image */}
            <img
                src={data.backgroundImage}
                alt="Porsche GT3 RS in dark garage"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-70"></div>

            <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.gradient} rounded-full`}></div>
                    <div className="pl-8">
                        <div className="mb-8">
                            <div className="flex items-start justify-between mb-8">
                                <h2 className="text-5xl font-light text-white">Tech Specs</h2>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className={`bg-slate-800/70 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:${theme.border} appearance-none pr-8 text-sm cursor-pointer hover:bg-slate-700/70 transition-colors backdrop-blur-sm`}>
                                        <option value="Engine">Engine</option>
                                        <option value="Transmission">Transmission</option>
                                        <option value="Dimensions">Dimensions</option>
                                    </select>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <polyline points="6,9 12,15 18,9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {data[selectedCategory].map((spec, index) => (
                                <div
                                    key={`${selectedCategory}-${index}`}
                                    className="flex justify-between items-center py-4 border-b border-slate-600/40 hover:bg-slate-800/30 transition-all duration-200 px-2"
                                    style={{
                                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                                    }}
                                >
                                    <span className="text-slate-300 text-base font-light">{spec.label}</span>
                                    <span className="text-white font-semibold text-lg">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* <div className="relative lg:ml-8">
                    <div className="bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md border border-slate-700/30">
                        <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl overflow-hidden border border-slate-600/20">
                            <img
                            src={features}
                                alt="Porsche GT3 RS Technical Features"
                                className="w-full h-full object-cover object-center"
                            />
                        </div>

                        <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <div className="absolute top-4 right-4 w-1 h-8 bg-gradient-to-b from-yellow-400 to-transparent rounded-full"></div>
                    </div>
                </div> */}
            </div>
        </section>
    )
}

export default Features