<template>
  <div class="code-tab">
    <code-editor/>
    <button class="btn btn-primary" :disabled="!codeIsValid" @click="compile">Compile</button>
    <div class="mt-2" id="code-status">
      <template v-if="codeIsValid">
        <vue-feather class="text-success inline-icon" type="check"></vue-feather>
        Code is valid
      </template>
      <template v-else>
        <vue-feather class="text-danger inline-icon" type="x"></vue-feather>
        Code is not valid
      </template>
    </div>
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
