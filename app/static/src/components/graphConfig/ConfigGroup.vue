<template>
    <div id="graph-configs-instruction" class="ms-2">
        Drag variables to 'Hidden variables' to remove them from your graph, or click
        'Add Graph' to create a new graph to move them to.
    </div>
    <template v-for="config in configs" :key="JSON.stringify(config)">
        <div class="graph-config-panel m-2"
             @drop="onDrop(config.id, $event)"
             @dragover.prevent
             @dragenter.prevent>
            <button type="button"
                    class="btn btn-sm btn-light bg-transparent border-0 float-end delete-graph"
                    v-if="configs.length > 1"
                    @click="() => deleteGraph(config.id)"
                    v-tooltip="'Delete Graph'">
                <vue-feather class="inline-icon clickable ms-2" type="trash-2"></vue-feather>
            </button>
            <graph-settings :config="config"
                            class="graph-config-settings mb-1"></graph-settings>
            <div class="drop-zone"
                 :class="dragging ? 'drop-zone-active' : 'drop-zone-inactive'">
                <template v-for="variable in config.selectedVariables" :key="variable">
                    <variable-badge :variable="variable"
                                    :inHidden="false"
                                    @dragstart="event => startDrag(event, config.id, variable)"
                                    @removeVariable="variable => removeVariable(config, variable)"></variable-badge>
                </template>
                <div v-if="!config.selectedVariables.length"
                     class="drop-zone-instruction p-2 me-4">
                    Drag variables here to select them for this graph. Press the Ctrl or
                    ⌘ key on drag to make a copy of a variable.
                </div>
            </div>
        </div>
    </template>
    <button class="btn btn-primary mt-2 ms-2" id="add-graph-btn" @click="addGraph">
        <vue-feather size="20" class="inline-icon" type="plus"></vue-feather>
        Add Graph
    </button>
    <div class="hidden-variables-panel m-2"
         @drop="onDrop(hiddenConfigId, $event)"
         @dragover.prevent
         @dragenter.prevent>
        <h5>Hidden variables</h5>
        <div class="drop-zone"
             :class="dragging ? 'drop-zone-active' : 'drop-zone-inactive'">
            <template v-for="variable in hiddenVariables" :key="variable">
                <variable-badge :variable="variable"
                                :inHidden="false"
                                @dragstart="event => startDrag(event, hiddenConfigId, variable)"></variable-badge>
            </template>
            <div v-if="!hiddenVariables.length" class="drop-zone-instruction p-2 me-4">
                Drag variables here to hide them on all graphs.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import { AppState } from "@/store/appState/state";
import GraphSettings from "./GraphSettings.vue";
import { GraphConfig } from "@/store/graphs/state";
import VariableBadge from "./VariableBadge.vue";
import { newUid } from "@/utils";
import { GraphsMutation, UpdateConfigPayload, UpdateSyncedConfigGroupPayload } from "@/store/graphs/mutations";

enum DragData {
    Var = "variable",
    CfgId = "configId",
    DoCopy = "doCopy",
}

const hiddenConfigId = "hidden" as const;

export default defineComponent({
    components: {
        VueFeather,
        GraphSettings,
        VariableBadge,
    },
    setup() {
        const store = useStore<AppState>();
        const dragging = ref(false);

        // by convention we have the graph group id is the same string as the
        // openVisualisationTab
        const graphGroupId = computed(() => store.state.openVisualisationTab);

        const configs = computed(() => {
            const { syncedConfigGroupId } = store.state.graphs.syncedGraphGroups[graphGroupId.value];
            const { configIds } = store.state.graphs.syncedConfigGroups[syncedConfigGroupId];
            return configIds.map(id => store.state.graphs.configs.find(c => c.id === id)!);
        });

        const hiddenVariables = computed(() => {
            const allVariables = store.state.model.odinModelResponse?.metadata?.variables || [];
            const allSelectedVariables = configs.value.flatMap(c => c.selectedVariables);
            return allVariables.filter(v => !allSelectedVariables.includes(v));
        });

        const addGraph = () => {
            const newId = newUid();
            store.commit(`graphs/${GraphsMutation.AddConfig}`, newId);
            const { syncedConfigGroupId } = store.state.graphs.syncedGraphGroups[graphGroupId.value];
            const configGroup = store.state.graphs.syncedConfigGroups[syncedConfigGroupId];
            const newConfigGroup = { ...configGroup };
            newConfigGroup.configIds = [ ...newConfigGroup.configIds, newId ];
            store.commit(`graphs/${GraphsMutation.UpdateSyncedConfigGroup}`, {
                id: syncedConfigGroupId,
                value: newConfigGroup,
            } as UpdateSyncedConfigGroupPayload);
            store.commit(`graphs/${GraphsMutation.UpdateVisibleGraphGroups}`, [graphGroupId.value]);
        };

        const deleteGraph = (configId: string) => {
            store.commit(`graphs/${GraphsMutation.DeleteConfig}`, configId);
        };

        const startDrag = (event: DragEvent, configId: string, variable: string) => {
            const { dataTransfer, ctrlKey, metaKey } = event;
            // cannot copy variable from hidden to config as a variable cannot be hidden and
            // visible at the same time
            const copy = configId !== hiddenConfigId && (ctrlKey || metaKey);
            dataTransfer!.dropEffect = "move";
            dataTransfer!.effectAllowed = "move";
            dataTransfer!.setData(DragData.Var, variable);
            dataTransfer!.setData(DragData.CfgId, configId);
            dataTransfer!.setData(DragData.DoCopy, copy.toString());
            dragging.value = true;
        };

        const updateSelectedVariables = (configId: string, newVariables: string[]) => {
            store.commit(`graphs/${GraphsMutation.UpdateConfig}`, {
                id: configId,
                value: { selectedVariables: newVariables }
            } as UpdateConfigPayload)
        };

        const removeVariable = (config: GraphConfig, variableToRemove: string) => {
            const newVariables = config.selectedVariables.filter(v => v !== variableToRemove);
            updateSelectedVariables(config.id, newVariables);
        };

        const addVariable = (config: GraphConfig, variableToAdd: string) => {
            const newVariables = [ ...config.selectedVariables, variableToAdd ];
            updateSelectedVariables(config.id, newVariables);
        };

        const onDrop = (configId: string, event: DragEvent) => {
            const { dataTransfer } = event;
            const srcConfigId = dataTransfer!.getData(DragData.CfgId);
            const variable = dataTransfer!.getData(DragData.Var);
            const copy = dataTransfer!.getData(DragData.DoCopy) === "true";
            if (srcConfigId === configId) return;

            const config = configs.value.find(c => c.id === configId);
            const srcConfig = configs.value.find(c => c.id === srcConfigId);

            // 3 cases:
            //   1. src cfg -> hidden: remove var from all cfgs
            //   2. hidden -> this cfg: add var to this cfg
            //   3. src cfg -> this cfg: add var to this cfg and remove from src cfg if no copy
            if (configId === hiddenConfigId) {
                configs.value.forEach(cfg => removeVariable(cfg, variable));
            } else if (srcConfigId === hiddenConfigId) {
                addVariable(config!, variable);
            } else {
                addVariable(config!, variable);
                if (!copy) removeVariable(srcConfig!, variable);
            }

            dragging.value = false;
        };

        return {
            dragging,
            configs,
            addGraph,
            deleteGraph,
            startDrag,
            removeVariable,
            onDrop,
            hiddenConfigId,
            hiddenVariables,
        };
    }
});
</script>

<style scoped lang="scss">
.graph-config-panel {
    border-width: 1px;
    border-style: solid;
    border-color: #ccc;
    padding: 4px;
    .selected-variables-panel {
        width: 100%;

        .variable {
            font-size: large;
            cursor: pointer;
        }
    }
}
</style>
