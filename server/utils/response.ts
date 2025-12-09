export const response = <DataType = Record<string, unknown>>(code: number, msg: string, data: DataType) => ({
  code: code,
  msg: msg,
  data: data
});