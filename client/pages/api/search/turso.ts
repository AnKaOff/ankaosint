import { createClient } from "@libsql/client";

export const turso = createClient({
  url: "libsql://anka-anka.aws-us-east-2.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicm8iLCJpYXQiOjE3ODEyNzg4OTIsImlkIjoiMDE5ZWJjNjgtODcwMS03ZTIyLTlmNzUtNDE5YzY1MTlmNmYzIiwicmlkIjoiMTIwOTYxYjEtNDhmNy00MWI3LTlhYjktYjdhOTBiMzA5NmZhIn0.lKMFjCaRTOrnrY51CwJeJTKRCvHHcOXdNFwHMf3b3cYD14tzl8e_nFcM0cfVHRHEJ6JT4VXXj-I1Cm3Y0KaCDQ",
});