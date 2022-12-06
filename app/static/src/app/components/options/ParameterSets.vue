<template>
  <parameter-set v-for="paramSet in parameterSets" :parameter-set="paramSet" class="mt-2"></parameter-set>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";
import {useStore} from "vuex";
import ParameterSet from "./ParameterSet.vue";

export default defineComponent({
  name: "ParameterSets",
  components: {ParameterSet},
  setup(){
    const store = useStore();
    const parameterSets = computed(() => store.state.run.parameterSets);
    return {
      parameterSets
    };
  }
})
</script>