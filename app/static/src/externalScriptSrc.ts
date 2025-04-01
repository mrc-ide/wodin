/*
    Originally dynamic wodin returned a mustache template from the express server
    which had a

    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>

    tag in it but with the introduction of the wodin static build, we no longer
    control the html that is shipped to the user (the scientists write the html
    research papers with the static build).

    We could enforce that they add this script tag manually otherwise mathjax
    (latex style rendering in html) won't work but for the sake of the researchers'
    experience lets make it easier and less prone to errors by just programmatically
    adding the script tag.

    To load more external scripts, just append the src to the externalScripts array.
*/
export const externalScripts = [
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
];

export const loadThirdPartyCDNScripts = () => {
    externalScripts.forEach(src => {
        const script = document.createElement("script");
        script.defer = true;
        script.src = src;
        document.body.append(script);
    });
};
