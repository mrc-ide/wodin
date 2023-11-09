import * as plotly from "plotly.js-basic-dist-min";
import downloadPlot from "../../../../src/app/components/mixins/downloadPlot";

jest.mock("plotly.js-basic-dist-min", () => ({
    downloadImage: jest.fn(),
    Icons: {
        camera: "camera"
    }
}));

const mockGd = () => ({
    layout: {
        title: "Test Layout Title",
        xaxis: {
            title: {
                text: "test x"
            }
        },
        yaxis: {
            title: {
                text: "test y"
            }
        },
        width: 600,
        height: 400
    }
} as any);

describe("downloadPlot mixin", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockDownloadPlotlyImage = jest.spyOn(plotly, "downloadImage");

    it("has expected refs", () => {
        const {
            showDownloadImageModal,
            plotlyContext
        } = downloadPlot();
        expect(showDownloadImageModal.value).toBe(false);
        expect(plotlyContext.value).toBe(null);
    });

    it("has expected download image props", () => {
        const { downloadImageProps } = downloadPlot();
        expect(downloadImageProps).toStrictEqual({ title: "", xLabel: "", yLabel: "" });
    });

    it("has expected config", () => {
        const { config } = downloadPlot();
        expect(config.responsive).toBe(true);
        const buttons = config.modeBarButtons as plotly.ModeBarButton[][];
        expect(buttons[0][0].name).toBe("Download plot as a png");
    });

    it("closeModal updates showDownloadImageModal", () => {
        const {
            closeModal,
            showDownloadImageModal
        } = downloadPlot();
        // update the ref value to true so we can check the method resets it
        showDownloadImageModal.value = true;
        closeModal();
        expect(showDownloadImageModal.value).toBe(false);
    });

    it("downloadImageClick updates downloadImageProps from plotly values and shows modal", () => {
        const {
            config,
            plotlyContext,
            showDownloadImageModal,
            downloadImageProps
        } = downloadPlot();
        const downloadImageClick = (config.modeBarButtons as plotly.ModeBarButton[][])[0][0].click;
        const gd = mockGd();
        downloadImageClick(gd, {} as any);
        expect(plotlyContext.value).toStrictEqual(gd);
        expect(downloadImageProps).toStrictEqual({ title: "Test Layout Title", xLabel: "test x", yLabel: "test y" });
        expect(showDownloadImageModal.value).toBe(true);
    });

    it("downloadImage updates plotly context and invokes plotly download image", () => {
        // call downloadImageClick to inject the plotly context into the mixin
        const {
            downloadImage,
            config
        } = downloadPlot();
        const downloadImageClick = (config.modeBarButtons as plotly.ModeBarButton[][])[0][0].click;
        const gd = mockGd();
        downloadImageClick(gd, {} as any);
        downloadImage("new title", "new x axis", "new y axis");
        expect(gd.layout.title).toBe("new title");
        expect(gd.layout.xaxis.title).toStrictEqual({ text: "new x axis" });
        expect(gd.layout.yaxis.title).toStrictEqual({ text: "new y axis" });
        expect(mockDownloadPlotlyImage).toHaveBeenCalledWith(gd, {
            filename: "WODIN plot",
            format: "png",
            width: 600,
            height: 400
        });
    });
});
