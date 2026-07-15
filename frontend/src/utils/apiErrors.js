export function getApiErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Request failed';
}

export function getApiValidationErrors(error) {
  const payload = error?.response?.data?.data;
  return payload && typeof payload === 'object' ? payload : null;
}

