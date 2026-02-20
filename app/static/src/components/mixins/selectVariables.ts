import { Store } from "vuex";
import { computed } from "vue";
import { AppState } from "../../store/appState/state";
import { GraphsAction, UpdateGraphPayload } from "../../store/graphs/actions";
import { Graph } from "@/store/graphs/state";

export interface SelectVariablesMixin {
    startDrag: (evt: DragEvent, variable: string) => void;
    endDrag: () => void;
    onDrop: (evt: DragEvent) => void;
    removeVariable: (srcGraphId: string, variable: string) => void;
}

export default (
    store: Store<AppState>,
    emit: (event: string, ...args: unknown[]) => void,
    hasHiddenVariables: boolean,
    graph?: Graph
): SelectVariablesMixin => {
    const thisSrcGraphConfig = hasHiddenVariables ? "hidden" : graph!.id;

    const startDrag = (event: DragEvent, variable: string) => {
        const { dataTransfer, ctrlKey, metaKey } = event;
        const copy = !hasHiddenVariables && (ctrlKey || metaKey);
        dataTransfer!.dropEffect = "move";
        dataTransfer!.effectAllowed = "move";
        dataTransfer!.setData("variable", variable);
        dataTransfer!.setData("srcGraphConfig", thisSrcGraphConfig);
        dataTransfer!.setData("copyVar", copy.toString());

        emit("setDragging", true);
    };

    const endDrag = () => {
        emit("setDragging", false);
    };

    const updateSelectedVariables = (graphId: string, newVariables: string[]) => {
        store.dispatch(`graphs/${GraphsAction.UpdateGraph}`, {
            id: graphId, config: { selectedVariables: newVariables }
        } as UpdateGraphPayload);
    };

    const removeVariable = (graphId: string, variable: string) => {
        const graphConfig = store.state.graphs.graphs.find(g => g.id === graphId)!.config;
        const srcVariables = graphConfig.selectedVariables.filter((v) => v !== variable);
        updateSelectedVariables(graphId, srcVariables);
    };

    const selectedVariables = computed<string[]>(() =>
        hasHiddenVariables ? [] : graph!.config.selectedVariables
    );

    const onDrop = (evt: DragEvent) => {
        const { dataTransfer } = evt;
        const variable = dataTransfer!.getData("variable");
        const srcGraphConfig = dataTransfer!.getData("srcGraphConfig");
        if (srcGraphConfig !== thisSrcGraphConfig) {
            const copy = !hasHiddenVariables && dataTransfer!.getData("copyVar") === "true";

            // add to this graph if necessary - do this before remove so, if a linked variable, it is not unlinked
            if (!hasHiddenVariables && !selectedVariables.value.includes(variable)) {
                const newVars = [...selectedVariables.value, variable];
                updateSelectedVariables(graph!.id, newVars);
            }

            if (srcGraphConfig !== "hidden" && !copy) {
                // Remove variable from all graphs where it occurs if this is HiddenVariables, otherwise from source
                // graph only
                if (hasHiddenVariables) {
                    store.state.graphs.graphs.forEach(g => {
                        if (g.config.selectedVariables.includes(variable)) {
                            removeVariable(g.id, variable);
                        }
                    });
                } else {
                    removeVariable(srcGraphConfig, variable);
                }
            }
        }
    };

    return {
        removeVariable,
        startDrag,
        endDrag,
        onDrop
    };
};
