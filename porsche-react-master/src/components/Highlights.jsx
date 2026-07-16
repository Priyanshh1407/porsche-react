const Highlights = ({ data, theme }) => {
    return (
        <section class="text-white min-h-[400px] flex flex-col justify-center items-center p-4 pt-20">
            <div class="max-w-5xl w-full">
                <div class="relative mb-8">
                    <div class={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.gradient} rounded-full`}></div>

                    <div class="pl-8 max-w-md">
                        <h1 class="text-5xl font-light leading-tight mb-6 text-white">
                            {data.title}
                        </h1>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            {data.description}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {data.features.map((feature, index) => (
                        <div
                            key={index}
                            className={`group hover:transform hover:-translate-y-2 transition-all duration-300 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm hover:bg-${theme.hoverBg || "slate-700/40"} hover:border-${theme.hoverBorder || "yellow-400"}`}
                        >
                            <div className="mb-6">
                                {feature.subtitle && (
                                    <div className="w-20 h-16 flex items-center justify-center text-white font-bold text-xl mb-4">
                                        {feature.subtitle}
                                    </div>
                                )}
                                <h3 className={`text-sm font-bold ${theme.text} uppercase tracking-widest mb-3`}>
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-gray-300 text-base leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Highlights