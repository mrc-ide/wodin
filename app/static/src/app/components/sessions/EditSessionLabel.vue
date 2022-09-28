<template>
  <div>
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="modalStyle">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Session Label</h5>
          </div>
          <div class="modal-body">
            <div class="row" id="edit-session-label">
              <div class="col-2">
                <label class="col-form-label">Label</label>
              </div>
              <div class="col-10">
                <input v-model="sessionLabelInternal" type="text" class="form-control">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    id="ok-session-label"
                    @click="updateSessionLabel">OK</button>
            <button class="btn btn-outline"
                    id="cancel-session-label"
                    @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch
} from "vue";
import { useStore } from "vuex";
import { AppStateAction } from "../../store/appState/actions";
import {SessionsAction} from "../../store/sessions/actions";

export default defineComponent({
    name: "EditSessionLabel",
    props: {
        open: {
            type: Boolean,
            required: true
        },
        sessionId: {
            type: String,
            required: true
        },
        sessionLabel: {
            type: String,
            required: true
        }
    },
    setup(props, { emit }) {
        const store = useStore();
        const sessionLabelInternal = ref<string>("");

        const modalStyle = computed(() => {
            return { display: props.open ? "block" : "none" };
        });

        watch(() => props.open, (newValue) => {
            if (newValue) {
                sessionLabelInternal.value = props.sessionLabel;
            }
        });

        const close = () => {
            emit("close");
        };
        const updateSessionLabel = () => {
            const payload = {id: props.sessionId, label: sessionLabelInternal.value};
            store.dispatch(`sessions/${SessionsAction.SaveSessionLabel}`, payload);
            close();
        };

        return {
            sessionLabelInternal,
            modalStyle,
            close,
            updateSessionLabel
        };
    }

});
</script>
