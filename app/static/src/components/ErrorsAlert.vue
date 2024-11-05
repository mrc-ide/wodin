<template>
    <div>
        <div v-if="errors.length > 0" class="alert alert-danger text-danger alert-dismissible fade show" role="alert">
            <button type="button" class="btn-close float-end" aria-label="Close" @click="dismissErrors"></button>
            <strong>{{ errors.length > 1 ? "Errors occurred:" : "An error occurred:" }}</strong>
            <ul class="mb-0">
                <li v-for="(error, idx) in errors" :key="idx">
                    {{ error.detail || error.error }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { ErrorsMutation } from "../store/errors/mutations";

export default defineComponent({
    name: "ErrorsAlert",
    setup() {
        const store = useStore();
        const namespace = "errors";

        const errors = computed(() => store.state.errors.errors);

        function dismissErrors() {
            store.commit(`${namespace}/${ErrorsMutation.DismissErrors}`, { root: true });
        }

        return {
            errors,
            dismissErrors
        };
    }
});
</script>
