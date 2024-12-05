<template>
    <div>
        <button
            class="btn btn-primary"
            id="download-summary-btn"
            :disabled="downloading || !canDownloadSummary"
            @click="toggleShowDownloadSummary(true)"
        >
            <vue-feather size="20" class="inline-icon" type="download"></vue-feather>
            Download summary
        </button>
        <div v-if="downloading" id="downloading">
            <LoadingSpinner size="xs"></LoadingSpinner>
            Downloading...
        </div>
    </div>
    <DownloadOutput
        :open="showDownloadSummary"
        :download-type="downloadType"
        :include-points="false"
        v-model:user-file-name="downloadSummaryUserFileName"
        @download="downloadSummary"
        @close="toggleShowDownloadSummary(false)"
    ></DownloadOutput>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import DownloadOutput from "@/components/DownloadOutput.vue";
import VueFeather from "vue-feather";
import { useStore } from "vuex";
import baseSensitivity from "../mixins/baseSensitivity";

export default defineComponent({
    name: "SensitivitySummaryDownload",
    components: { VueFeather, DownloadOutput, LoadingSpinner },
    props: {
        multiSensitivity: {
            type: Boolean,
            required: false
        },
        downloadType: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        // eslint-disable-next-line vue/no-setup-props-destructure
        const { canDownloadSummary, downloading, downloadSummaryUserFileName, downloadSummary } = baseSensitivity(
            store,
            props.multiSensitivity
        );
        const showDownloadSummary = ref(false);
        const toggleShowDownloadSummary = (show: boolean) => {
            showDownloadSummary.value = show;
        };

        return {
            canDownloadSummary,
            downloading,
            showDownloadSummary,
            downloadSummaryUserFileName,
            toggleShowDownloadSummary,
            downloadSummary
        };
    }
});
</script>
