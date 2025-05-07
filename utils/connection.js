const BASE_URL = "http://ecommerce.local/api/app.php";

/* Post Data To Backend */
export const postData = async (path, data) => {
  try {
    const url = `${BASE_URL}/${path}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    console.error("POST Error:", error);
    alert("Something went wrong. Please try again.");
    throw error;
  }
};

/* Get Data From Backend */
export const getData = async (path) => {
  try {
    const url = `${BASE_URL}/${path}`;
    const response = await fetch(url, {
      method: "GET",
    });

    return response;
  } catch (error) {
    console.error("GET Error:", error);
    alert("Something went wrong. Please try again.");
    throw error;
  }
};

/* Delete Data From Backend */
export const deleteData = async (path, data) => {
  try {
    const url = `${BASE_URL}/${path}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    console.error("DELETE Error:", error);
    alert("Something went wrong. Please try again.");
    throw error;
  }
};

/* Update Data in Backend */
export const patchData = async (path, data) => {
  try {
    const url = `${BASE_URL}/${path}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    console.error("PATCH Error:", error);
    alert("Something went wrong. Please try again.");
    throw error;
  }
};
