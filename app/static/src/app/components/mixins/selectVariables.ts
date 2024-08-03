import { Store } from "vuex";
import { computed } from "vue";
import { AppState } from "../../store/appState/state";
import { GraphsAction } from "../../store/graphs/actions";

export interface SelectVariablesMixin {
    startDrag: (evt: DragEvent, variable: string) => void;
    endDrag: () => void;
    onDrop: (evt: DragEvent) => void;
    removeVariable: (srcGraphIdx: number, variable: string) => void;
}

export default (
    store: Store<AppState>,
    emit: (event: string, ...args: unknown[]) => void,
    hasHiddenVariables: boolean,
    graphIndex?: number
): SelectVariablesMixin => {
    const thisSrcGraphConfig = hasHiddenVariables ? "hidden" : graphIndex!.toString();

    const startDrag = (evt: DragEvent, variable: string) => {
        const { dataTransfer, ctrlKey } = evt;
        const copy = !hasHiddenVariables && ctrlKey;
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

    const updateSelectedVariables = (graphIdx: number, newVariables: string[]) => {
        store.dispatch(`graphs/${GraphsAction.UpdateSelectedVariables}`, {
            graphIndex: graphIdx,
            selectedVariables: newVariables
        });
    };

    const removeVariable = (srcGraphIdx: number, variable: string) => {
        const srcVariables = store.state.graphs.config[srcGraphIdx].selectedVariables.filter((v) => v !== variable);
        updateSelectedVariables(srcGraphIdx, srcVariables);
    };

    const selectedVariables = computed<string[]>(() =>
        hasHiddenVariables ? [] : store.state.graphs.config[graphIndex!].selectedVariables
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
                updateSelectedVariables(graphIndex!, newVars);
            }

            if (srcGraphConfig !== "hidden" && !copy) {
                // Remove variable from all graphs where it occurs if this is HiddenVariables, otherwise from source
                // graph only
                if (hasHiddenVariables) {
                    store.state.graphs.config.forEach((config, index) => {
                        if (config.selectedVariables.includes(variable)) {
                            removeVariable(index, variable);
                        }
                    });
                } else {
                    removeVariable(parseInt(srcGraphConfig, 10), variable);
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
