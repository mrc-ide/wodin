<template>
  <code-editor/>
  <button class="btn btn-primary" :disabled="!codeIsValid" @click="compile">Compile</button>
  <div v-if="codeIsValid">
    <vue-feather type="check"></vue-feather>
    Code is valid
  </div>
  <div v-if="!codeIsValid">
    Code is not valid
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import CodeEditor from "./CodeEditor.vue";
import { ModelAction } from "../../store/model/actions";

export default defineComponent({
    name: "CodeTab",
    components: {
        CodeEditor,
        VueFeather
    },
    setup() {
        const store = useStore();
        const codeIsValid = computed(() => store.state.model.odinModelResponse?.valid);

        const compile = () => store.dispatch(`model/${ModelAction.CompileModel}`);

        return {
            codeIsValid,
            compile
        };
    }
});
</script>
