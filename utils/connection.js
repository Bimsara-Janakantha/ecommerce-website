const BASE_URL = "http://ecommerce.local/api/app.php";

/* Post Data To Backend */
export const postData = async (path, data) => {
  const url = `${BASE_URL}/${path}`;

  const isFormData = data instanceof FormData;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      body: isFormData ? data : JSON.stringify(data),
    });

    const resBody = await response.json();

    if (!response.ok) {
      // Throw a custom error object
      throw {
        status: response.status,
        message: resBody.error || "Unknown error",
      };
    }

    return {
      status: response.status,
      data: resBody,
    };
  } catch (error) {
    console.error("POST Error:", error);
    throw error; // let caller handle it
  }
};

/* Get Data From Backend */
export const getData = async (path) => {
  try {
    const url = `${BASE_URL}/${path}`;
    const response = await fetch(url, {
      method: "GET",
    });

    const resBody = await response.json();

    if (!response.ok) {
      // Throw a custom error object
      throw {
        status: response.status,
        message: resBody.error || "Unknown error",
      };
    }
    return {
      status: response.status,
      data: resBody,
    };
  } catch (error) {
    console.error("GET Error:", error);
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

    const resBody = await response.json();

    if (!response.ok) {
      // Throw a custom error object
      throw {
        status: response.status,
        message: resBody.error || "Unknown error",
      };
    }

    return {
      status: response.status,
      data: resBody,
    };
  } catch (error) {
    console.error("DELETE Error:", error);
    throw error;
  }
};

/* Update Data in Backend */
export const updateData = async (path, data) => {
  try {
    const url = `${BASE_URL}/${path}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resBody = await response.json();

    if (!response.ok) {
      // Throw a custom error object
      throw {
        status: response.status,
        message: resBody.error || "Unknown error",
      };
    }

    return {
      status: response.status,
      data: resBody,
    };
  } catch (error) {
    console.error("PATCH Error:", error);
    throw error;
  }
};
