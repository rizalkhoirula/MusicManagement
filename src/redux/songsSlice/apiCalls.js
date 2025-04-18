import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";
import * as actions from "./index";

export const createSong = async (songData, dispatch) => {
  dispatch(actions.createSongStart());

  try {
    // Kirim langsung sebagai JSON karena file sudah diupload ke Supabase
    const { data } = await axiosInstance.post("/songs", songData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch(actions.createSongSuccess(data.data));
    toast.success(data.message);
    return true;
  } catch (error) {
    console.error("Error creating song:", error?.response?.data || error);
    dispatch(actions.createSongFailure());
    toast.error(error?.response?.data?.message || "Failed to create song");
    return false;
  }
};

export const getAllSongs = async (dispatch) => {
  dispatch(actions.getAllSongsStart());
  try {
    const { data } = await axiosInstance.get("/songs");
    dispatch(actions.getAllSongsSuccess(data.data));
    return true;
  } catch (error) {
    dispatch(actions.getAllSongsFailure());
    return false;
  }
};

export const updateSong = async (id, songData, dispatch) => {
  dispatch(actions.updateSongStart());
  try {
    const { data } = await axiosInstance.put(`/songs/${id}`, songData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch(actions.updateSongSuccess(data.data));
    toast.success(data.message);
    return true;
  } catch (error) {
    console.error("Error updating song:", error?.response?.data || error);
    dispatch(actions.updateSongFailure());
    toast.error(error?.response?.data?.message || "Failed to update song");
    return false;
  }
};

export const deleteSong = async (id, dispatch) => {
  dispatch(actions.deleteSongStart());
  try {
    const { data } = await axiosInstance.delete(`/songs/${id}`);
    dispatch(actions.deleteSongSuccess(id));
    toast.success(data.message);
    return true;
  } catch (error) {
    console.error("Error deleting song:", error?.response?.data || error);
    dispatch(actions.deleteSongFailure());
    toast.error("Failed to delete song");
    return false;
  }
};
