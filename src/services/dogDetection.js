export async function detectDog(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch("http://127.0.0.1:8000/detect", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data;
}