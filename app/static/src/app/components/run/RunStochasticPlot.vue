<template>
  <wodin-plot
      :fade-plot="fadePlot"
      :placeholder-message="placeholderMessage"
      :end-time="endTime"
      :plot-data="allPlotData"
      :redraw-watches="[seriesSet]"
      :recalculate-on-relayout="false">
    <slot></slot>
  </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import userMessages from "../../userMessages";
import { WodinPlotData, discreteSeriesSetToPlotly} from "../../plot";
import WodinPlot from "../WodinPlot.vue";

export default defineComponent({
  name: "RunStochasticPlot",
  props: {
    fadePlot: Boolean
  },
  components: {
    WodinPlot
  },
  setup() {
    const store = useStore();

    const placeholderMessage = userMessages.run.notRunYet;

    const seriesSet = computed(() => (store.state.run.resultDiscrete?.seriesSet));

    const endTime = computed(() => store.state.run.endTime);

    const palette = computed(() => store.state.model.paletteModel);

    const allPlotData = (): WodinPlotData => {
      if (seriesSet.value) {
        return discreteSeriesSetToPlotly(seriesSet.value, palette.value);
      } else {
        return [];
      }
    };

    return {
      placeholderMessage,
      endTime,
      seriesSet,
      allPlotData
    };
  }
});
</script>
