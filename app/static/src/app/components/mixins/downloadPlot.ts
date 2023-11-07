import {reactive, Ref, ref} from "vue";
import {Config, PlotlyDataLayoutConfig, RootOrData} from "plotly.js-basic-dist-min";
import * as Plotly from "plotly.js-basic-dist-min";

export interface DownloadPlotMixin {
    showDownloadImageModal: Ref<boolean>,
    plotlyContext: Ref<PlotlyDataLayoutConfig | null>,
    downloadImageProps: { title: string, xLabel: string, yLabel: string },
    closeModal: () => void,
    downloadImage: (title: string, xLabel: string, yLabel: string) => void,
    config: Partial<Config>
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

    const config = {
        responsive: true,
        modeBarButtons: [[{
            name: "Download plot as a png",
            icon: (Plotly as any).Icons.camera,
            click: downloadImageClick
        },
            "zoom2d",
            "pan2d",
            "zoomIn2d",
            "zoomOut2d",
            "autoScale2d",
            "resetScale2d"]]
    } as Partial<Config>;

    return {
        showDownloadImageModal,
        plotlyContext,
        downloadImageProps,
        closeModal,
        downloadImage,
        config
    };
};