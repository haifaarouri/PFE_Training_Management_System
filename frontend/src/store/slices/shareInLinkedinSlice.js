import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  image: "",
  message: "",
};

const shareInLinkedinSlice = createSlice({
  name: "linkedinSlice",
  initialState,
  reducers: {
    setImage(state, action) {
      state.image = action.payload;
    },
    setMessage(state, action) {
      state.message = action.payload;
    },
  },
});

export const { setImage, setMessage } = shareInLinkedinSlice.actions;
export default shareInLinkedinSlice.reducer;
