import {reactive, Ref, ref} from "vue";
import {PlotlyDataLayoutConfig, RootOrData} from "plotly.js-basic-dist-min";
import * as Plotly from "plotly.js-basic-dist-min";

export interface DownloadPlotMixin {
    showDownloadImageModal: Ref<boolean>,
    plotlyContext: Ref<PlotlyDataLayoutConfig | null>,
    downloadImageProps: { title: string, xLabel: string, yLabel: string },
    downloadImageClick: (gd: PlotlyDataLayoutConfig) => void,
    closeModal: () => void,
    downloadImage: (title: string, xLabel: string, yLabel: string) => void
}

export default (): DownloadPlotMixin => {
    const showDownloadImageModal = ref(false);
    const plotlyContext: Ref<PlotlyDataLayoutConfig | null> = ref(null);
    const downloadImageProps = reactive({ title: "", xLabel: "", yLabel: "" });
    const downloadImageClick = (gd: PlotlyDataLayoutConfig) => {
        plotlyContext.value = gd;
        const layout = gd.layout! as any;
        downloadImageProps.title = layout.title || "";
        downloadImageProps.xLabel = layout.xaxis.title?.text || "";
        downloadImageProps.yLabel = layout.yaxis.title?.text || "";
        showDownloadImageModal.value = true;
    };
    const closeModal = () => {
        showDownloadImageModal.value = false;
    };

    const downloadImage = (title: string, xLabel: string, yLabel: string) => {
        console.log(`x axis is ${xLabel}`)
        console.log(`old x axis is ${JSON.stringify( plotlyContext.value!.layout!.xaxis)}`)
        plotlyContext.value!.layout!.title = title;
        (plotlyContext.value!.layout!.xaxis! as any).title = {text: xLabel};
        (plotlyContext.value!.layout!.yaxis! as any).title = {text: yLabel};
        Plotly.downloadImage(plotlyContext.value as RootOrData, {
            filename: "WODIN plot",
            format: "png",
            width: (plotlyContext.value as any)._fullLayout.width,
            height: (plotlyContext.value as any)._fullLayout.height
        });
    };

    return {
        showDownloadImageModal,
        plotlyContext,
        downloadImageProps,
        downloadImageClick,
        closeModal,
        downloadImage
    };
};