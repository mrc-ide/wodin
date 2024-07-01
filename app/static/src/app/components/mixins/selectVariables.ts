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
    hiddenVariables: boolean,
    graphIndex?: number
): SelectVariablesMixin => {
    const thisSrcGraph = hiddenVariables ? "hidden" : graphIndex!.toString();

    const startDrag = (evt: DragEvent, variable: string) => {
        const { dataTransfer } = evt;
        dataTransfer!.dropEffect = "move";
        dataTransfer!.effectAllowed = "move";
        dataTransfer!.setData("variable", variable);
        dataTransfer!.setData("srcGraph", thisSrcGraph);

        emit("setDragging", true);
    };

    const endDrag = () => {
        emit("setDragging", false);
    };

    const updateSelectedVariables = (graphIdx: number, newVariables: string[]) => {
        store.dispatch(`graphs/${GraphsAction.UpdateSelectedVariables}`, {
            graphIdx,
            selectedVariables: newVariables
        });
    };

    // Remove variable from a given graph
    const removeVariable = (srcGraphIdx: number, variable: string) => {
        const srcVariables = [...store.state.graphs.config[srcGraphIdx].selectedVariables].filter(
            (v) => v !== variable
        );
        updateSelectedVariables(srcGraphIdx, srcVariables);
    };

    const selectedVariables = computed<string[]>(() =>
        hiddenVariables ? [] : store.state.graphs.config[graphIndex!].selectedVariables
    );

    const onDrop = (evt: DragEvent) => {
        const { dataTransfer } = evt;
        const variable = dataTransfer!.getData("variable");
        const srcGraph = dataTransfer!.getData("srcGraph");
        if (srcGraph !== thisSrcGraph) {
            // remove from source graph
            if (srcGraph !== "hidden") {
                removeVariable(parseInt(srcGraph, 10), variable);
            }
            // add to this graph if necessary
            if (!hiddenVariables && !selectedVariables.value.includes(variable)) {
                const newVars = [...selectedVariables.value, variable];
                updateSelectedVariables(graphIndex!, newVars);
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
