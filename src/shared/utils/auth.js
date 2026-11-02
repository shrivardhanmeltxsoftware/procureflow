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

export const getStoredAdmin = () => {
  const storedAdmin = localStorage.getItem("admin");
  if (!storedAdmin) return null;

  try {
    return JSON.parse(storedAdmin);
  } catch (error) {
    console.error("Could not read the stored admin account:", error);
    return null;
  }
};
