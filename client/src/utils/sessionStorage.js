export const setToken = (token) => {
  sessionStorage.setItem("USER_SESS_TOKEN", token);
};

export const getToken = () => {
  return sessionStorage.getItem("USER_SESS_TOKEN");
};

export const removeToken = () => {
  sessionStorage.removeItem("USER_SESS_TOKEN");
};
