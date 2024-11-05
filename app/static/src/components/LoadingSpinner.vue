<template>
    <span class="spinner-border" :style="{ ...style, color: '#0d6efd' }"></span>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: ["size"],
    computed: {
        style() {
            if (this.size === "xs") {
                return {
                    height: "40px",
                    width: "40px",
                    "border-width": "6px"
                };
            }
            if (this.size === "sm") {
                return {
                    height: "100px",
                    width: "100px",
                    "border-width": "20px"
                };
            }
            return {
                height: "200px",
                width: "200px",
                "border-width": "25px"
            };
        }
    }
});
</script>
