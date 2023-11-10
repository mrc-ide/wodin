<template>
  <wodin-plot
    :fade-plot="fadePlot"
    :placeholder-message="placeholderMessage"
    :end-time="endTime"
    :plot-data="allPlotData"
    :redrawWatches="solution ? [solution] : []"
  >
    <slot></slot>
  </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import { filterSeriesSet, fitDataToPlotly, odinToPlotly, WodinPlotData } from "../../plot";
import WodinPlot from "../WodinPlot.vue";

export default defineComponent({
  name: "FitPlot",
  components: { WodinPlot },
  props: {
    fadePlot: Boolean
  },
  setup() {
    const store = useStore();

    const placeholderMessage = userMessages.modelFit.notFittedYet;

    // If we're displaying a reloaded session with fit, we should be able to plot the previous fit plot without
    // re-running fit. Determine if this is the case, by checking if we have a fit result but no fit solution
    // (which is not persisted)
    const plotRehydratedFit = computed(() => {
      const { modelFit } = store.state;
      const result = modelFit.result && !modelFit.result.solution && !modelFit.result.error;
      return result;
    });

    const solution = computed(() => {
      return plotRehydratedFit.value ? store.state.run.resultOde?.solution : store.state.modelFit.result?.solution;
    });

    const endTime = computed(() => {
      return plotRehydratedFit.value
        ? store.state.modelFit.result.inputs.endTime
        : store.getters[`fitData/${FitDataGetter.dataEnd}`];
    });

    const link = computed(() => {
      return plotRehydratedFit.value
        ? store.state.modelFit.result.inputs.link
        : store.getters[`fitData/${FitDataGetter.link}`];
    });

    const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
      const { data } = store.state.fitData;
      const result =
        solution.value &&
        solution.value({
          mode: "grid",
          tStart: start,
          tEnd: end,
          nPoints: points
        });
      if (!data || !link.value || !result) {
        return [];
      }
      const palette = store.state.model.paletteModel;
      return [
        ...odinToPlotly(filterSeriesSet(result, [link.value.model]), palette),
        ...fitDataToPlotly(data, link.value, palette, start, end)
      ];
    };

    return {
      placeholderMessage,
      solution,
      endTime,
      allPlotData
    };
  }
});
</script>
