import multer from "multer"

export default multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb: any) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported"), false);
    }
  },
});