import mongoose from "mongoose";

declare const process : {
  env: {
  DB_STRING: string
  }
  exit: (code?: number) => void
}

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.DB_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

