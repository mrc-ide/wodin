<template>
    <div class="container mt-5" style="max-width: 1141px">
      <h2>Sessions</h2>
      <div class="row mb-3">
        <div class="col-22">
          The current Session is <a href="#">Vary D Parameter (19/08/2022 14:37:12)</a>
        </div>
      </div>

      <div class="row fw-bold py-2">
        <div class="col-3">Saved</div>
        <div class="col-3">Label</div>
        <div class="col-2 text-center" id="edit-label">Edit Label</div>
        <div class="col-2 text-center">Load</div>
        <div class="col-2 text-center">Share</div>
      </div>
      <div class="row py-2">
        <div class="col-3">19/08/2022 14:37:12</div>
        <div class="col-3">Vary D Parameter</div>
        <div class="col-2 text-center"><vue-feather type="edit-2" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="upload" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="share-2" style="vertical-align: bottom;"></vue-feather></div>
      </div>
      <div class="row py-2">
        <div class="col-3">19/08/2022 11:19:04</div>
        <div class="col-3 text-muted">--no label--</div>
        <div class="col-2 text-center"><vue-feather type="edit-2" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="upload" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="share-2" style="vertical-align: bottom;"></vue-feather></div>
      </div>

      <div class="row py-2">
        <div class="col-3">18/08/2022 16:22:40</div>
        <div class="col-3 text-muted">--no label--</div>
        <div class="col-2 text-center"><vue-feather type="edit-2" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="upload" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="share-2" style="vertical-align: bottom;"></vue-feather></div>
      </div>

      <div class="row py-2">
        <div class="col-3">18/08/2022 16:01:59</div>
        <div class="col-3">Default run</div>
        <div class="col-2 text-center"><vue-feather type="edit-2" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="upload" style="vertical-align: bottom;"></vue-feather></div>
        <div class="col-2 text-center"><vue-feather type="share-2" style="vertical-align: bottom;"></vue-feather></div>
      </div>
    </div>
  <!-- SHARE MODAL -->
  <!--<div class="modal-backdrop fade show"></div>
  <div class="modal show" style="display: block">
    <div class="modal-dialog modal-lg  modal-dialog-centered" style="width: 900px !important;;">
      <div class="modal-content">
        <h5 class="modal-header">Share link</h5>
        <div class="modal-body">
          <p>Copy this link to share session 'Vary D parameter' saved at 19/08/2022 14:37:12:</p>

          <div>
                <span style="background-color: #e6f4ea;color: #1e8e3e;">
                  https://wodin.dide.ic.ac.uk/apps/day1/sessions/abc123
                </span>
            <button class="btn btn-sm btn-white ms-5">Copy</button>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  </div>-->
  <!-- EDIT LABEL DIALOG -->
  <!--<div class="modal-backdrop fade show"></div>
  <div class="modal show" style="display: block">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <h5 class="modal-header">Edit Session Label</h5>
        <div class="modal-body">
          <form>
            <div class="form-group row">
              <label for="name" class="col-2 col-form-label font-weight-bold text-right">Label</label>
              <div class="col-10">
                <input type="text" id="targetToFit" name="name" class="form-control">
              </div>
            </div>

          </form>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-white">Cancel</button>
        </div>
      </div>
    </div>
  </div>-->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VueFeather from "vue-feather";

export default defineComponent({
  name: "WodinSessions",
  components: {VueFeather}
});
</script>
<style scoped>
  i {
    color: #479fb6;
  }

  a {
    color: #479fb6;
    text-decoration: none;
  }

  .btn-white {
    background-color: #fff;
    border-color: #007bff;
    color: #007bff !important;
  }
</style>
