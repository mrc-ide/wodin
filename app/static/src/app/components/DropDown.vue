<template>
    <div class="dropdown">
        <a href="#"
           class="dropdown-toggle text-decoration-none"
           role="button"
           data-bs-toggle="dropdown"
           aria-expanded="false">WODIN v{{ 1.3 }}</a>
        <ul class="dropdown-menu">
            <slot name="items"></slot>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "DropDown"
});
</script>
