import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  msg: "",
};

const msgSlice = createSlice({
  name: "successMassageSlice",
  initialState,
  //contains functions that will change msg value
  reducers: {
    setMsg(state, action) {
      state.msg = action.payload;
    },
  },
});

export const { setMsg } = msgSlice.actions;
export default msgSlice.reducer;
