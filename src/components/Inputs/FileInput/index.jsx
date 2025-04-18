import { useRef, useState } from "react";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import supabase from "../../../utils/supabaseClient"; // Import supabase client
import Button from "../../Button";
import styles from "./styles.module.scss";
import BackupIcon from "@mui/icons-material/Backup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const FileInput = ({
  name,
  label,
  value,
  icon,
  type,
  handleInputState,
  ...rest
}) => {
  const inputRef = useRef();
  const [progress, setProgress] = useState(0);
  const [progressShow, setProgressShow] = useState(false);

  const handleUpload = async () => {
    setProgressShow(true);
    const fileName = value.name; // Use the original file name without timestamp
    const bucketName = "musicbucket"; // Referring to your actual bucket
    const folder = type === "audio" ? "songs" : "images"; // Specify the appropriate folder
    const filePath = `${folder}/${fileName}`; // Path in the bucket

    const file = value;

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true }); // If file already exists, overwrite it

      if (error) {
        toast.error("An error occurred while uploading!");
        console.error(error);
      } else {
        // Get the file URL after successful upload
        // Ensure the URL includes the bucket name
        const fileUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/musicbucket/${filePath}`;
        handleInputState(name, fileUrl); // Return the file URL to parent component

        if (type === "audio") {
          const audio = new Audio(fileUrl);
          audio.addEventListener("loadedmetadata", () => {
            const duration = Math.floor(audio.duration);
            handleInputState("duration", duration);
          });
        }
      }
    } catch (error) {
      console.error("Error during upload:", error);
      toast.error("An error occurred while uploading!");
    }

    // Track upload progress (using Supabase's upload progress API)
    const fileUpload = supabase.storage.from(bucketName);

    // Create an upload task
    const uploadTask = fileUpload.upload(filePath, file, { upsert: true });

    uploadTask
      .then(() => {
        setProgress(100); // Complete the progress at 100%
        console.log("File uploaded successfully");
      })
      .catch((error) => {
        console.error("Error during file upload:", error);
        toast.error("An error occurred while uploading!");
      });

    // Since Supabase Storage API does not have `on()` method, progress tracking isn't implemented here.
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => handleInputState(name, e.currentTarget.files[0])}
        {...rest}
      />

      <Button
        style={{
          width: "15rem",
          border: "1px solid black",
          background: "transparent",
        }}
        onClick={() => inputRef.current.click()}
        label={label}
      />
      {type === "image" && value && (
        <img
          src={typeof value === "string" ? value : URL.createObjectURL(value)}
          alt="file"
        />
      )}
      {type === "audio" && value && (
        <audio
          src={typeof value === "string" ? value : URL.createObjectURL(value)}
          controls
        />
      )}
      {value !== null && !progressShow && typeof value !== "string" && (
        <Button
          onClick={handleUpload}
          startIcon={<BackupIcon />}
          label="Upload"
          style={{ width: "11rem" }}
        />
      )}
      {progressShow && progress < 100 && (
        <div className={styles.progress_container}>
          <CircularProgress
            className={styles.progress}
            variant="determinate"
            value={progress}
          />
          <p>{progress}%</p>
        </div>
      )}
      {progress === 100 && (
        <div className={styles.progress_container}>
          <CheckCircleIcon className={styles.success} />
        </div>
      )}
    </div>
  );
};

export default FileInput;
