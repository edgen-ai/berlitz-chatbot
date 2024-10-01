
import { NextRequest } from "next/server";
import { IncomingForm, Fields, Files } from "formidable";


/**
 * Parses multipart/form-data requests using formidable.
 * @param req - The incoming Next.js request.
 * @returns A promise that resolves with parsed fields and files.
 */
function parseMultipartFormData(
  req: NextRequest
): Promise<{ fields: Fields; files: Files }> {
  const form = new IncomingForm();
  return new Promise((resolve, reject) => {
    console.log("Parsing form data")
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
  

  export { parseMultipartFormData };