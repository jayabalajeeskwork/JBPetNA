export const formatPhoneNumber = (value: string, includeCode = false) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  const prefix = includeCode ? "+1 " : "";
  if (digits.length <= 3) return `${prefix}(${digits}`;
  if (digits.length <= 6) return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};
