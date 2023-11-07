import { reactive, Ref, ref } from "vue";
import {
    Config,
    PlotlyDataLayoutConfig,
    RootOrData,
    Icons,
    downloadImage as downloadPlotlyImage, DataTitle
} from "plotly.js-basic-dist-min";

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
        const layout = gd.layout!;
        downloadImageProps.title = layout.title as string || "";
        downloadImageProps.xLabel = (layout.xaxis?.title as Partial<DataTitle | null>)?.text || "";
        downloadImageProps.yLabel = (layout.yaxis?.title as Partial<DataTitle | null>)?.text || "";
        showDownloadImageModal.value = true;
    };
    const closeModal = () => {
        showDownloadImageModal.value = false;
    };

    const downloadImage = (title: string, xLabel: string, yLabel: string) => {
        plotlyContext.value!.layout!.title = title;
        plotlyContext.value!.layout!.xaxis!.title = { text: xLabel };
        plotlyContext.value!.layout!.yaxis!.title = { text: yLabel };
        downloadPlotlyImage(plotlyContext.value as RootOrData, {
            filename: "WODIN plot",
            format: "png",
            width: plotlyContext.value!.layout!.width!,
            height: plotlyContext.value!.layout!.height!
        });
    };

    const config = {
        responsive: true,
        modeBarButtons: [[{
            name: "Download plot as a png",
            icon: Icons.camera,
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
