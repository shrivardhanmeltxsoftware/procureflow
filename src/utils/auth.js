export const getStoredVendor = () => {
  const storedVendor = localStorage.getItem("vendor");
  if (!storedVendor) return null;

  try {
    return JSON.parse(storedVendor);
  } catch (error) {
    console.error("Could not read the stored vendor account:", error);
    return null;
  }
};
