import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store/Store";

interface CountersState {
  buttonClicks: number;
}

const initialState: CountersState = {
  buttonClicks: 10,
};

export const countersSlice = createSlice({
  name: "counters",
  initialState,
  reducers: {
    increaseButtonClicks(state, action: PayloadAction<void>) {
      state.buttonClicks = state.buttonClicks + 1;
    },
  },
});

const getButtonClicks = (state: RootState) => state.counters.buttonClicks;

export const CountersSelector = {
  getButtonClicks,
};

export const CountersAction = {
  ...countersSlice.actions,
};

export default countersSlice.reducer;
