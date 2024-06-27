import {AppState} from "../../store/appState/state";
import {Store} from "vuex";

export interface DragVariablesMixin {
    startDrag: (evt: DragEvent, variable: string) => void;
    endDrag: () => void,
}

export default (
    store: Store<AppState>,
    emit: (event: string, ...args: any[]) => void,
    hiddenVariables: boolean,
    graphIndex?: number): DragVariablesMixin  => {
    const startDrag = (evt: DragEvent, variable: string) => {
        const { dataTransfer } = evt;
        dataTransfer!!.dropEffect = "move";
        dataTransfer!!.effectAllowed = "move";
        dataTransfer!!.setData("variable", variable);
        dataTransfer!!.setData("srcGraph", hiddenVariables ? "hidden" : graphIndex!.toString());

        emit("setDragging", true);
    };

    const endDrag = () => {
        emit("setDragging", false);
    };

    return {
        startDrag,
        endDrag,
    };
}