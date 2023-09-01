import {Store} from "vuex";
import {AppState} from "../../store/appState/state";
import {computed} from "vue";
import {ModelGetter} from "../../store/model/getters";

export default (store: Store<AppState>) => {
    const hasRunner = computed(() => store.getters[`model/${ModelGetter.hasRunner}`]);

    const sensitivityPrerequisitesReady = computed(() => {
        return hasRunner.value && !!store.state.model.odin
            && !store.state.model.compileRequired;
    });

    return { sensitivityPrerequisitesReady };
};