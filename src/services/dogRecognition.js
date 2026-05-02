export async function matchDog(imageFile, pinId) {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("pin_id", pinId);

  const response = await fetch(
    `http://127.0.0.1:8000/embed?pin_id=${pinId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data;
}