const externalScripts = [
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
];

export const mountScriptTags = () => {
    externalScripts.forEach(src => {
        const script = document.createElement("script");
        script.defer = true;
        script.src = src;
        document.body.append(script);
    });
};
